import Report from '../models/report.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  },
});

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Controller function to upload and store reports
const addReport = async (req, res) => {
  upload(req, res, async function(err) {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        message: 'File upload error', 
        error: err.message
      });
    } 
    // Handle other errors
    else if (err) {
      console.error('Unknown error during upload:', err);
      return res.status(500).json({ 
        message: 'Error during file upload', 
        error: err.message
      });
    }

    // Check if file exists after upload
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        help: 'Make sure you are sending a file with field name "file" and using multipart/form-data encoding'
      });
    }

    try {
      // Get user ID from authenticated request
      const userId = req.user._id;
      
      // Get report type from request body
      const { reportType } = req.body;

      // Validate required fields
      if (!userId) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!reportType) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Report type is required' });
      }

      // Create new report document
      const report = new Report({
        userId: userId,
        reportType: reportType,
        link: req.file.path
      });

      // Mongoose will validate against schema enum values
      await report.save();

      res.status(201).json({
        message: 'Report added successfully',
        report: {
          id: report._id,
          userId: report.userId,
          reportType: report.reportType,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadDate: report.createdAt
        }
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Invalid report data',
          error: error.message,
          validReportTypes: ['Reports', 'Xray', 'City-Scan', 'Blood-report', 'Other']
        });
      }

      console.error('Database error:', error);
      res.status(500).json({
        message: 'Error saving report',
        error: error.message
      });
    }
  });
};

// Get reports for a specific user
const getReportsByUser = async (req, res) => {
  try {
    const  userId  = req.user._id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const reports = await Report.find({ userId })
      .populate('userId', 'name email') // Populate user details
      .sort('-createdAt'); // Sort by newest first
    
    res.status(200).json({
      message: 'Reports retrieved successfully', 
      reports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

export { addReport, getReportsByUser };