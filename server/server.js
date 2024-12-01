const express = require("ultimate-express");
const fs = require("fs");
const path = require("path");

// Initialize app with HTTPS options
const app = express({
  uwsOptions: {
    key_file_name: path.join(__dirname, "server/key.pem"),
    cert_file_name: path.join(__dirname, "server/cert.pem"),
  },
});

// Middleware to parse JSON requests
app.use(express.json());

// Route to retrieve data from the JSON file
app.get("/", (req, res) => {
  const key = req.query.key;
  if (!key) {
    return res.status(400).send("Missing key");
  }

  const filePath = path.join(__dirname, "shiftData.json");
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Data file not found");
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!(key in data)) {
    return res.status(404).send("Key not found");
  }

  res.status(200).json(data[key]);
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

  data[key] = value;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  res.status(200).send("Data stored successfully");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
