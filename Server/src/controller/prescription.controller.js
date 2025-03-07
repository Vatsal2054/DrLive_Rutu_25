import Prescription from "../models/prescription.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const newPrescription = async (req, res) => {
  try {
    const { userId, prescription } = req.body;
    const doctor = await User.findById(req.user._id);
    if (!doctor) {
      throw new ApiError(401, "Unauthorized request", false);
    }

    const user = userId;
    

    console.log(user, doctor, prescription);
    

    // Validate required fields
    if (
      !user ||
      !doctor ||
      !Array.isArray(prescription) ||
      prescription.length === 0
    ) {
      return res
        .status(400)
        .json(new ApiError(400, "Missing required fields", false));
    }

    // Validate each prescription item
    for (const med of prescription) {
      if (
        !med.medicineName ||
        !med.quantity ||
        !Array.isArray(med.frequency) ||
        med.frequency.length === 0 ||
        !med.timing
      ) {
        return res
          .status(400)
          .json(
            new ApiError(400, "Missing required fields in prescription", false)
          );
      }

      // Validate frequency values
      const validFrequencies = ["morning", "afternoon", "evening"];
      if (!med.frequency.every((freq) => validFrequencies.includes(freq))) {
        return res
          .status(400)
          .json(
            new ApiError(
              400,
              "Invalid frequency value. Must be morning, afternoon, or evening",
              false
            )
          );
      }

     
    }

    const newPrescription = await Prescription.create({
      user,
      doctor,
      prescription,
      date: new Date(),
    });

    // Populate user and doctor details
    const populatedPrescription = await Prescription.findById(
      newPrescription._id
    )
      .populate("user", "firstName lastName email")
      .populate("doctor", "firstName lastName specialization email");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          populatedPrescription,
          "Prescription created successfully"
        )
      );
  } catch (error) {
    console.error("Error creating prescription:", error);
    return res
      .status(500)
      .json(new ApiError(500, "server error", error.message));
  }
};

const listPrescription = async (req, res) => {
  try {
    const userId = req.user._id;
    const prescriptions = await Prescription.find({
      $or: [{ user: userId }, { doctor: userId }],
    })
      .populate("user", "firstName lastName email")
      .populate("doctor", "firstName lastName specialization email");

    if (!prescriptions || prescriptions.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No prescriptions found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          prescriptions,
          "Prescriptions retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error in listPrescription:", error);
    return res
      .status(500)
      .json(new ApiError(500, "server error", error.message));
  }
};

const getAllPrescriptionsForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const prescriptions = await Prescription.find({ user: userId })
      .populate({
        path: "doctor",
        select: "firstName lastName specialization email",
      })
      .sort({ createdAt: -1 });

    if (!prescriptions || prescriptions.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No prescriptions found"));
    }

    const formattedPrescriptions = prescriptions.map((prescription) => ({
      id: prescription._id,
      date: prescription.date,
      doctor: {
        id: prescription.doctor._id,
        name: `${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
        specialization: prescription.doctor.specialization,
        email: prescription.doctor.email,
      },
      prescription: prescription.prescription.map((med) => ({
        medicineName: med.medicineName,
        quantity: med.quantity,
        frequency: med.frequency,
        timing: med.timing,
        notes: med.notes || "",
      })),
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedPrescriptions,
          "Prescriptions retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error in getAllPrescriptionsForUser:", error);
    return res
      .status(500)
      .json(new ApiError(500, "server error", error.message));
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate("user", "firstName lastName email")
      .populate("doctor", "firstName lastName specialization email");

    if (!prescription) {
      return res
        .status(404)
        .json(new ApiError(404, "Prescription not found", false));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          prescription,
          "Prescription retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error in getPrescriptionById:", error);
    return res
      .status(500)
      .json(new ApiError(500, "server error", error.message));
  }
};

export {
  newPrescription,
  getAllPrescriptionsForUser,
  getPrescriptionById,
  listPrescription,
};
