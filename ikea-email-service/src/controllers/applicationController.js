const {
  sendRecruiterEmail,
  sendCandidateEmail,
} = require("../services/emailService");

/**
 * Handles job application submissions
 */
const handleApplication = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const job =
      typeof req.body.job === "string"
        ? JSON.parse(req.body.job)
        : req.body.job;
    const cvFile = req.file;
    await Promise.all([
      sendCandidateEmail({ fullName, email, phone, job }),
      sendRecruiterEmail({ fullName, email, phone, job }, cvFile),
    ]);

    res.status(200).json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send emails",
      details: error.message,
    });
  }
};

module.exports = { handleApplication };
