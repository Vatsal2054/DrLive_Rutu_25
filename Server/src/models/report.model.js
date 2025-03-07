import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    reportType: {
      type: String,
      required: true,
      enum: ['Reports', 'Xray', 'City-Scan', 'Blood-report', 'Other'],
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
