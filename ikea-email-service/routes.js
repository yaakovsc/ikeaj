const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  handleApplication,
} = require("./src/controllers/applicationController");
const { getJobsWithCache } = require("./src/services/adamService");

/**
 * Multer configuration for CV file uploads
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("רק קבצי PDF, DOC ו-DOCX מותרים"));
    }
  },
});

/**
 * POST /send-application
 * Submit a job application with optional CV file
 */
router.post("/send-application", upload.single("cvFile"), handleApplication);

router.get("/fetch-jobs", async (req, res) => {
  const data = await getJobsWithCache();
  if (!data) return res.status(500).send("failed");

  res.setHeader("Content-Type", "application/json");
  res.send(data);
});

module.exports = router;
