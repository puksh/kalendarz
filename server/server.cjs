const express = require("ultimate-express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Initialize app with HTTPS options
const app = express({
  uwsOptions: {
    //key_file_name: path.join(__dirname, "server/key.pem"),
    //cert_file_name: path.join(__dirname, "server/cert.pem"),
  },
});
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// Define the JSON file path
const filePath = path.join(__dirname, "shiftData.json");

// Utility function to read the file
const readDataFile = () => {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Utility function to write to the file
const writeDataFile = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Route to retrieve data from the JSON file
app.get("/", (req, res) => {
  const key = req.query.key;
  const data = readDataFile();

  if (key) {
    if (!(key in data)) {
      return res.status(404).send("Key not found");
    }
    return res.status(200).json(data[key]);
  }

  res.status(200).json(data); // Return the entire file if no key is provided
});

// Route to update or add data for a specific key
app.put("/", (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).send("Missing key or value");
  }

  const data = readDataFile();
  data[key] = value;

  writeDataFile(data);
  res.status(200).send("Data updated successfully");
});

// Route to replace the entire file
app.post("/", (req, res) => {
  const newData = req.body;
  if (typeof newData !== "object" || Array.isArray(newData)) {
    return res.status(400).send("Invalid data format");
  }

  writeDataFile(newData);
  res.status(200).send("File replaced successfully");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
