const express = require("express");
const router = express.Router();
const {
  saveCryptoData,
  fetchCryptoData,
  getCryptoStats,
  getCryptoPriceDeviation,
} = require("../controllers/cryptoController");

/**
 * @route GET /api/crypto/fetch
 * @description Fetches cryptocurrency data from the CoinGecko API, saves it to the database, and returns the data.
 * @returns {Object} JSON object containing a success message and the cryptocurrency data.
 * @throws {Object} 500 - Error message if the data fetching from the API fails.
 */
router.get("/fetch", async (req, res) => {
  try {
    const cryptoData = await fetchCryptoData(); // Fetch the data from the CoinGecko API
    await saveCryptoData(cryptoData); // Save the data to MongoDB

    res.status(200).json({
      message: "Crypto data fetched, saved, and returned successfully.",
      data: cryptoData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching crypto data from CoinGecko API" });
  }
});

/**
 * @route GET /api/crypto/stats
 * @description Retrieves the latest statistics of a specific cryptocurrency.
 * @query {string} coin - The name of the cryptocurrency (bitcoin, matic-network, ethereum).
 * @returns {Object} JSON object containing the price, market cap, and 24-hour change of the specified cryptocurrency.
 * @throws {Object} 400 - Error message if the coin parameter is invalid or missing.
 * @throws {Object} 500 - Error message if retrieving cryptocurrency stats fails.
 */
router.get("/stats", async (req, res) => {
  const coin = req.query.coin;
  if (!coin || !["bitcoin", "matic-network", "ethereum"].includes(coin)) {
    return res.status(400).json({ error: "Invalid or missing coin parameter" });
  }

  try {
    const stats = await getCryptoStats(coin);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving cryptocurrency stats" });
  }
});

/**
 * @route GET /api/crypto/deviation
 * @description Calculates the standard deviation of the price of the requested cryptocurrency for the last 100 records.
 * @query {string} coin - The name of the cryptocurrency (bitcoin, matic-network, ethereum).
 * @returns {Object} JSON object containing the standard deviation of the price or a message if there is insufficient data.
 * @throws {Object} 400 - Error message if the coin parameter is invalid or missing.
 * @throws {Object} 500 - Error message if the calculation of the cryptocurrency price deviation fails.
 */
router.get("/deviation", async (req, res) => {
  const coin = req.query.coin;
  if (!coin || !["bitcoin", "matic-network", "ethereum"].includes(coin)) {
    return res.status(400).json({ error: "Invalid or missing coin parameter" });
  }

  try {
    const result = await getCryptoPriceDeviation(coin);
    if (result.message) {
      // Handle the case when there isn't enough data to calculate the standard deviation
      return res.status(200).json({ message: result.message });
    }
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error calculating cryptocurrency price deviation" });
  }
});

module.exports = router;
