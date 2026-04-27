const express = require("express");
const router = express.Router();
const { getJobsWithCache } = require("./src/services/adamService");

router.get("/fetch-jobs", async (req, res) => {
  const result = await getJobsWithCache();
  if (!result) return res.status(500).json({ error: "failed to load jobs" });

  res.json({ jobs: result.jobs, source: result.source });
});

module.exports = router;
