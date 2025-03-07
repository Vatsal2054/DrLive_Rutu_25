import { ApiError } from "./ApiError.js";
import nodemailer from "nodemailer";
const isDoctor = (req, res, next) => {
  if (req.user.role === "doctor") {
    next();
  } else {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Access denied. Only doctors can access this route.",
          false
        )
      );
  }
};
const isPatient = (req, res, next) => {
  if (req.user.role === "patient") {
    next();
  } else {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Access denied. Only patients can access this route.",
          false
        )
      );
  }
};

async function sendCustomMail({ senderName, senderEmail, recipientEmails, subject, textBody }) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,  // Use environment variables for security
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: `${senderName} <${senderEmail}>`, // Sender name and email
            to: recipientEmails.join(','), // Multiple recipients supported
            subject,
            text: textBody, // Plain text body
            
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, message: info.response };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: error.message };
    }
}

// Example usage
sendCustomMail({
    senderName: 'Your Name',
    senderEmail: 'your-email@gmail.com',
    recipientEmails: ['user1@example.com', 'user2@example.com'],
    subject: 'Custom Email',
    textBody: 'This is a plain text email body.',
    htmlBody: '<h3>This is an HTML email body</h3>'
});

export { isDoctor, isPatient };
