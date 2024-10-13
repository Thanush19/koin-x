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

/**
 * @route GET /
 * @description A test route to verify that the server is running.
 * @returns {string} A simple message indicating that the server is running.
 */
app.get("/", (req, res) => {
  res.send("Hello, World! The server is running!");
});

// Use the crypto routes for handling API requests
app.use("/api/crypto", cryptoRoutes);

/**
 * @description Schedules a background job to fetch and save cryptocurrency data every 2 hours using node-cron.
 * The cron job runs at the top of every 2nd hour.
 *
 */
cron.schedule("0 */2 * * *", async () => {
  console.log("Fetching cryptocurrency data...");
  try {
    const cryptoData = await fetchCryptoData(); // Fetch data from the CoinGecko API
    await saveCryptoData(cryptoData); // Save the fetched data to the database
    console.log("Crypto data successfully fetched and saved.");
  } catch (error) {
    console.error("Error during scheduled crypto data fetch:", error.message);
  }
});

const PORT = process.env.PORT || 3000;

/**
 * @description Starts the server on the specified port and logs a message to the console.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
