// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./db/db");
const cryptoRoutes = require("./routes/cryptoRouter");
const {
  fetchCryptoData,
  saveCryptoData,
} = require("./controllers/cryptoController");
const cron = require("node-cron");

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

// Use the crypto routes
app.use("/api/crypto", cryptoRoutes);

// Schedule the job to run every 2 hours
cron.schedule("0 */2 * * *", async () => {
  console.log("Fetching cryptocurrency data...");
  try {
    const cryptoData = await fetchCryptoData(); // Fetch data
    await saveCryptoData(cryptoData); // Save data to the database
    console.log("Crypto data successfully fetched and saved.");
  } catch (error) {
    console.error("Error during scheduled crypto data fetch:", error.message);
  }
});

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
