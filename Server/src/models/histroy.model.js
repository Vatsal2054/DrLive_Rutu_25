import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    history: [
      {
        disease: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        prescription: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


const History = mongoose.model("History", historySchema);

export default History;