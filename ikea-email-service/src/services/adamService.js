const axios = require("axios");
const fs = require("fs");
const path = require("path");

const JSON_FILE = path.join(__dirname, "../assets/adam_all_orders_json.json");
const LAST_FETCH_FILE = path.join(__dirname, "../../last_fetch.txt");
const CONFIG_FILE = path.join(__dirname, "../../config.json");
const BASE_URL = process.env.ADAM_API_BASE_URL;
const token = process.env.ADAM_API_TOKEN;

// TODO: Reading jobs from ADAM — will be enabled once ADAM_API_BASE_URL and
// ADAM_API_TOKEN are provided by IKEA IT. Until then, always returns null so
// the system falls back to the local JSON cache.
async function adamGetDataFromApi() {
  console.log("ADAM integration pending — skipping live fetch, using local cache");
  return null;

  /* --- enable when ADAM credentials are available ---
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
  --- */
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
  return new Date(fs.readFileSync(LAST_FETCH_FILE, "utf8"));
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
      // ADAM unreachable — fall back to local cache
      console.warn("ADAM unavailable — serving local cache");
    }

    return { jobs: localData, source: 'cache' };
  } catch (err) {
    console.error("cache error:", err);
    return null;
  }
}

// TODO: Sending application to ADAM — will be enabled once ADAM_API_BASE_URL
// and ADAM_API_TOKEN are provided and the candidate payload structure is confirmed
// with IKEA IT. Until then, applications are delivered by email only (mailer.js).
async function AddCandidateWithFiles(candidateDetails) {
  console.log("ADAM integration pending — application not forwarded to ADAM", candidateDetails);
  return null;

  /* --- enable when ADAM credentials and payload spec are available ---
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
  --- */
}

module.exports = {
  adamGetDataFromApi,
  getJobsWithCache,
  AddCandidateWithFiles,
};
