import mongoose, { Schema } from "mongoose";

const prescriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    prescription: [
      {
        medicineName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        frequency: {
          type: [String],
          required: true,
          enum: ["morning", "afternoon", "evening"],
        },
        timing: {
          type: String,
          required: true,
          // enum: ["before meal", "after meal", "with meal"],
        },
        notes: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
