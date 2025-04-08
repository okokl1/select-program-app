// server.js

const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load your service account credentials.
// On Heroku, we’ll set an environment variable called SERVICE_ACCOUNT_JSON.
// Locally, fallback to reading the JSON file.
let credentials;
if (process.env.SERVICE_ACCOUNT_JSON) {
  // Parse the environment variable value (make sure it is valid JSON).
  credentials = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} else {
  // Local development: read credentials from a file.
  credentials = JSON.parse(fs.readFileSync('select-program-456118-a1a8ed8301b2.json', 'utf8'));
}

// Setup Google API auth using the service account
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Your Google Sheet ID (update if needed)
const SPREADSHEET_ID = '1BP16GCFseVXYhnklxwJWKgKpcXhYdvmaqMC3OxSf8-s';

// [--- All your existing endpoints (program-data, student-info, input-data, submit-data) remain unchanged ---]

// Endpoint to get program data (range: A2:D13 on sheet "program")
app.get('/program-data', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'program!A2:D13', // Adjust range if needed
    });
    const rows = response.data.values || [];
    const programs = rows.map(r => ({
      program: r[0],
      capacity: r[1],
      reserved: r[2],
      available: r[3]
    }));
    res.json(programs);
  } catch (error) {
    console.error('Error getting program data:', error);
    res.status(500).send('Error getting program data');
  }
});

// The rest of your endpoints (student-info, input-data, submit-data) remain the same...

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
