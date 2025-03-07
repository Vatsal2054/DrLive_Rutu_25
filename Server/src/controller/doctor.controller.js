import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Appointment from "../models/appointment.model.js";

const getDoctor = async (req, res) => {
  try {
    // Find all users with role "doctor" and their corresponding doctor details
    const doctors = await User.aggregate([
      {
        $match: { role: "doctor" },
      },
      {
        $lookup: {
          from: "doctors", // Collection name (MongoDB automatically lowercases and pluralizes)
          localField: "_id",
          foreignField: "userId", // Changed to match the Doctor model schema
          as: "doctorInfo",
        },
      },
      {
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: false, // Changed to false since we want only matched doctors
        },
      },
      {
        $project: {
          password: 0,
          role: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "doctorInfo._id": 0,
          "doctorInfo.userId": 0,
          "doctorInfo.createdAt": 0,
          "doctorInfo.updatedAt": 0,
          "doctorInfo.__v": 0,
        },
      },
      {
        $addFields: {
          degree: "$doctorInfo.degree",
          specialization: "$doctorInfo.specialization",
          experience: "$doctorInfo.experience",
          workingPlace: "$doctorInfo.workingPlace",
          isAvailable: "$doctorInfo.isAvailable",
        },
      },
      {
        $project: {
          doctorInfo: 0, // Remove the nested doctorInfo object after flattening
        },
      },
    ]);

    if (!doctors.length) {
      throw new ApiError(404, "No doctors found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiError(error.statusCode, error.message));
    }
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching doctors", error.message));
  }
};

const getDoctorsNearUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    const MAX_DISTANCE_METERS = 3000; // 3 km constant

    // Validate user authentication
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Fetch user with location
    const currentUser = await User.findById(userId).lean();
    if (!currentUser || !currentUser.geoLocation?.coordinates) {
      throw new ApiError(404, "User location information not found");
    }

    // Validate coordinates format
    const coordinates = currentUser.geoLocation.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new ApiError(400, "Invalid user location coordinates");
    }

    // Prepare geo query
    const userLocation = {
      type: "Point",
      coordinates: [coordinates[0], coordinates[1]], // Ensure [lng, lat] order
    };

    // Check geo index (optional - remove in production if not needed)
    const indexes = await User.collection.indexes();
    const hasGeoIndex = indexes.some(
      (index) => index.key?.["geoLocation.coordinates"] === "2dsphere"
    );
    if (!hasGeoIndex) {
      console.warn(
        "Consider adding 2dsphere index on geoLocation.coordinates for better performance"
      );
    }

    // Execute geo query
    const doctors = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              currentUser.geoLocation.coordinates[0], // longitude
              currentUser.geoLocation.coordinates[1], // latitude
            ],
          },
          distanceField: "distance",
          maxDistance: MAX_DISTANCE_METERS,
          spherical: true,
          query: {
            role: "doctor",
            _id: { $ne: userId },
            "geoLocation.coordinates": {
              $exists: true,
              $type: "array",
              $ne: null,
            },
          },
          distanceMultiplier: 0.001, // Meters to kilometers
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "userId",
          as: "doctorInfo",
          pipeline: [{ $match: { isAvailable: true } }],
        },
      },
      { $unwind: { path: "$doctorInfo", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          avatar: 1,
          address: 1,
          distanceInKm: { $round: ["$distance", 2] },
          specialization: "$doctorInfo.specialization",
          experience: "$doctorInfo.experience",
          workingPlace: "$doctorInfo.workingPlace",
        },
      },
      { $sort: { distanceInKm: 1 } },
    ]);

    // Log results for debugging
    console.log(
      `Found ${doctors.length} doctors within ${MAX_DISTANCE_METERS}m`
    );

    // Format response
    return res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    // Enhanced error handling
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error.message || "Error fetching nearby doctors";

    console.error("Error in getDoctorsNearUser:", {
      message,
      stack: error.stack,
      userId: req.user?._id,
    });

    return res.status(statusCode).json({
      success: false,
      error: new ApiError(statusCode, message),
    });
  }
};

const dashboard = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get all stats and appointments in a single aggregation
    const [dashboardStats] = await Appointment.aggregate([
      {
        $facet: {
          // Today's appointments count
          todayAppointments: [
            {
              $match: {
                date: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
            {
              $count: "total",
            },
          ],
          // Pending appointments count
          pendingAppointments: [
            {
              $match: {
                status: "pending",
              },
            },
            {
              $count: "total",
            },
          ],
          // Completed appointments count
          completedAppointments: [
            {
              $match: {
                status: "completed",
              },
            },
            {
              $count: "total",
            },
          ],
          // Today's appointments list with patient details
          appointmentsList: [
            {
              $match: {
                date: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "patient",
              },
            },
            {
              $unwind: "$patient",
            },
            {
              $project: {
                time: 1,
                status: 1,
                patient: {
                  $concat: ["$patient.firstName", " ", "$patient.lastName"],
                },
              },
            },
            {
              $sort: {
                time: 1,
              },
            },
          ],
        },
      },
    ]);

    // Get total patients count
    const [totalPatientsCount] = await User.aggregate([
      {
        $match: {
          role: "patient",
        },
      },
      {
        $count: "total",
      },
    ]);

    // Format stats array

    const stats = [
      {
        title: "Today's Appointments",
        value: (dashboardStats.todayAppointments[0]?.total || 0).toString(),
      },
      {
        title: "Pending Appointments",
        value: (dashboardStats.pendingAppointments[0]?.total || 0).toString(),
      },
      {
        title: "Total Patients",
        value: (totalPatientsCount?.total || 0).toString(),
      },
      {
        title: "Completed Appointments",
        value: (dashboardStats.completedAppointments[0]?.total || 0).toString(),
      },
    ];

    // Format appointments list
    const appointments = dashboardStats.appointmentsList.map((apt) => ({
      time: apt.time,
      patient: apt.patient,
      status: apt.status,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        appointments,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

export { getDoctor, getDoctorsNearUser, dashboard };