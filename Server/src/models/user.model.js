import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor"],
      default: "patient",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    address: new Schema({
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
    }),
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add before creating the model
userSchema.index({ geoLocation: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;
