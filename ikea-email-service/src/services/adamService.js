const axios = require("axios");
const fs = require("fs");
const path = require("path");

const JSON_FILE = path.join(__dirname, "../assets/adam_all_orders_json.json");
const LAST_FETCH_FILE = path.join(__dirname, "../../last_fetch.txt");
const CONFIG_FILE = path.join(__dirname, "../../config.json");
const BASE_URL = process.env.ADAM_API_BASE_URL;
const token = process.env.ADAM_API_TOKEN;

async function adamGetDataFromApi() {
  try {
    const url = `${BASE_URL}Career/GetOrdersDetails`;
    const response = await axios.post(
      url,
      { token },
      { headers: { "Content-Type": "application/json" } },
    );
    const data = response.data;
    if (!Array.isArray(data)) {
      console.error("הנתונים שחזרו מאדם לא תקינים", data);
      return null;
    }
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), "utf8");
    fs.writeFileSync(LAST_FETCH_FILE, new Date().toISOString());
    return data;
  } catch (error) {
    console.error("adam error:", error.message);
    return null;
  }
}

function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { refreshMinutes: 30 };
    }

    const raw = fs.readFileSync(CONFIG_FILE, "utf8");

    if (!raw) return { refreshMinutes: 30 };

    return JSON.parse(raw);
  } catch (err) {
    console.error("config read error", err);
    return { refreshMinutes: 30 };
  }
}

function readLastFetchTime() {
  if (!fs.existsSync(LAST_FETCH_FILE)) return null;
  const content = fs.readFileSync(LAST_FETCH_FILE, "utf8").trim();
  if (!content) return null;
  const d = new Date(content);
  return isNaN(d.getTime()) ? null : d;
}

function readLocalData() {
  if (!fs.existsSync(JSON_FILE)) return null;

  const raw = fs.readFileSync(JSON_FILE, "utf8");

  if (!raw || raw.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse error, file corrupted");
    return null;
  }
}

async function getJobsWithCache() {
  try {
    const config = readConfig();
    const lastFetch = readLastFetchTime();
    const now = new Date();

    const localData = readLocalData();

    if (!localData) {
      const jobs = await adamGetDataFromApi();
      return jobs ? { jobs, source: 'live' } : null;
    }

    if (!lastFetch || (now - lastFetch) / 60000 > config.refreshMinutes) {
      console.log("Refreshing from API...");
      const jobs = await adamGetDataFromApi();
      if (jobs) return { jobs, source: 'live' };
      // ADAM truly unreachable — serve stale cache with warning
      console.warn("ADAM unavailable — serving local cache");
      return { jobs: localData, source: 'cache' };
    }

    // Cache is fresh — no need to call ADAM, no warning
    return { jobs: localData, source: 'live' };
  } catch (err) {
    console.error("cache error:", err);
    return null;
  }
}

async function AddCandidateWithFiles(candidateDetails) {
  const url = `${BASE_URL}Candidate/AddCandidateWithFiles`;
  try {
    const response = await axios.post(
      url,
      {
        token,
        phones: [candidateDetails.phone],
        candidateDetails: {
          first_name: candidateDetails.firstName,
          last_name:  candidateDetails.lastName,
          phone1:     candidateDetails.phone,
          Email:      candidateDetails.email,
        },
        ReplaceCandDetails: true,
      },
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    console.error("ADAM AddCandidateWithFiles error:", error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  adamGetDataFromApi,
  getJobsWithCache,
  AddCandidateWithFiles,
};
