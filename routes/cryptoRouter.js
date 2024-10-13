// routes/cryptoRouter.js
const express = require("express");
const router = express.Router();
const {
  saveCryptoData,
  fetchCryptoData,
  getCryptoStats,
  getCryptoPriceDeviation,
} = require("../controllers/cryptoController");

// Route to fetch, save, and respond with cryptocurrency data
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

// Route to get stats about a specific cryptocurrency
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

// Route to get the standard deviation of cryptocurrency prices
router.get("/deviation", async (req, res) => {
  const coin = req.query.coin;
  if (!coin || !["bitcoin", "matic-network", "ethereum"].includes(coin)) {
    return res.status(400).json({ error: "Invalid or missing coin parameter" });
  }

  try {
    const deviation = await getCryptoPriceDeviation(coin);
    res.status(200).json({ deviation: deviation.toFixed(2) });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error calculating cryptocurrency price deviation" });
  }
});

module.exports = router;
