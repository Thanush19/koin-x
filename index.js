// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./db/db"); // Import the database connection

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Hello, World! The server is running!");
});

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
