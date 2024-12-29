/* eslint-disable no-undef */
const express = require("ultimate-express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const port = 443;

// Initialize app with HTTPS options
const app = express({
  uwsOptions: {
    key_file_name: path.join(__dirname, "vuecalendar.kot.li-key.pem"),
    cert_file_name: path.join(__dirname, "vuecalendar.kot.li-crt.pem"),
  },
});

// Enable CORS
app.use(
  cors({
    origin: ["https://kal.kot.li", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Middleware to parse JSON requests
app.use(express.json());

// Route to retrieve data from the JSON file
app.get("/", (req, res) => {
  const key = req.query.key;
  //console.log(key);
  if (!key) {
    return res.status(400).send("Missing key");
  }

  const filePath = path.join(__dirname, "shiftData.json");

  //console.log(filePath);
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Data file not found");
  }

  // Read and parse the JSON data
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  //console.log(data);

  res.status(200).json(data);
});

// Route to update data in the JSON file
app.put("/", (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).send("Missing key or value");
  }

  const filePath = path.join(__dirname, "shiftData.json");
  let data = {};

  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // If the key is 'shiftData', update the data directly
  if (key === "shiftData") {
    try {
      const decodedValue = atob(value); // Decode the base64 value
      const parsedValue = JSON.parse(decodedValue); // Parse the JSON content
      data = { ...data, ...parsedValue }; // Merge with existing data
    } catch (err) {
      return res.status(400).send("Invalid data format:" + err);
    }
  } else {
    // Handle other keys if necessary
    data[key] = value;
  }

  // Write the updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  res.status(200).send("Data stored successfully");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
