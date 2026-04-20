require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling for multer and other errors
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "הקובץ גדול מדי. מקסימום 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      error: `שגיאת העלאת קובץ: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("מותרים")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "שגיאת שרת פנימית",
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("\n IKEA Email Service Started");
});
