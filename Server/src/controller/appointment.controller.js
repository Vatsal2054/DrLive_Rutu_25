import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
function generateRoomId(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < length; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomId;
}
const createAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, time, notes, type, doctorId } = req.body;

    // console.log(typeof(doctorId));
    const id = new mongoose.Types.ObjectId(doctorId);
    // console.log(id);
    const doctor = await User.findById(id);
    // console.log(doctor);
    // Ensure correct model
    if (!doctor) {
      return res.status(400).json(new ApiError(400, "Doctor not found", false));
    }

    let roomId = null;
    if (type === "online") {
      roomId = generateRoomId();
    }

    const appointment = new Appointment({
      userId,
      doctorId: id,
      date,
      time,
      notes,
      type,
      ...(roomId && { roomId }), // Add roomId only if it's not null
    });

    await appointment.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment created successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

// Import required models and utilities

const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const id = new mongoose.Types.ObjectId(userId);
    const appointments = await Appointment.aggregate([
      {
        $match: {
          userId: id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "userId",
          as: "doctor_details",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$doctor_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          doctor: { $mergeObjects: ["$doctor", "$doctor_details"] },
        },
      },
      {
        $project: {
          "doctor._id": 0, // Optionally hide duplicate _id fields
          doctor_details: 0, // Remove the now redundant doctor_details field
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointments, "Appointments fetched successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Server Error", error.message));
  }
};
const getAllPatientAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const id = new mongoose.Types.ObjectId(userId);

    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctorId: id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId", // Changed from "user" to "userId" to match the appointment schema
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "userId",
          foreignField: "userId",
          as: "patient_details", // Changed from "user_details" for clarity
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$patient_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          // Merge user and patient details, excluding duplicate fields
          user: {
            $mergeObjects: [
              {
                $arrayToObject: {
                  $filter: {
                    input: { $objectToArray: "$user" },
                    cond: { $ne: ["$$this.k", "_id"] },
                  },
                },
              },
              "$patient_details",
            ],
          },
        },
      },
      {
        $project: {
          patient_details: 0,
          "user._id": 0,
          // Add other fields you want to include
        },
      },
    ]);

    if (!appointments) {
      return res.status(404).json(new ApiError(404, "No appointments found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointments, "Appointments fetched successfully")
      );
  } catch (error) {
    console.error("Error in getAllPatientAppointments:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching appointments", error.message));
  }
};
const updateAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const { date, time, notes, type, doctorId } = req.body;
    const id = new mongoose.Types.ObjectId(appointmentId);
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id },
      { date, time, notes, type, doctorId },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment updated successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      userId,
    });
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment deleted successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const approveAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { status: "approved" },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment approved successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const declineAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { status: "cancelled" },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment declined successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const joinAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      type: "online",
    });
    const roomId = appointment.roomId;
    if (!roomId) {
      return res
        .status(400)
        .json(new ApiError(400, "Room ID not found", false));
    }
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { roomId }, "Appointment joined successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

// const getAppointmentById = async (req, res) => {
//   try {
//     const appointmentId = req.params.id;
//     const appointment = await Appointment.findOne({
//       _id: appointmentId,
//       userId: req.user._id,
//     });
//     if (!appointment) {
//       return res
//         .status(404)
//         .json(new ApiError(404, "Appointment not found", false));
//     }
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, appointment, "Appointment fetched successfully")
//       );
//   } catch (err) {
//     return res.status(500).json(new ApiError(500, "Server Error", err.message));
//   }
// };

export {
  createAppointment,
  getAllAppointments,
  // getAppointmentById,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  declineAppointment,
  joinAppointment,
  getAllPatientAppointments,
};
