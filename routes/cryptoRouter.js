// routes/cryptoRouter.js
const express = require("express");
const router = express.Router();
const {
  saveCryptoData,
  fetchCryptoData,
} = require("../controllers/cryptoController");

// Route to fetch, save, and respond with cryptocurrency data
router.get("/fetch", async (req, res) => {
  try {
    const cryptoData = await fetchCryptoData(); // Fetch the data from the CoinMarketCap API
    await saveCryptoData(cryptoData); // Save the data to MongoDB

    res.status(200).json({
      message: "Crypto data fetched, saved, and returned successfully.",
      data: cryptoData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching crypto data from CoinMarketCap API" });
  }
});

module.exports = router;
