// controllers/cryptoController.js
const axios = require("axios");
const Crypto = require("../models/cryptoSchema");

// Helper function to calculate standard deviation
const calculateStandardDeviation = (prices) => {
  const mean = prices.reduce((sum, value) => sum + value, 0) / prices.length;
  const squaredDiffs = prices.map((value) => Math.pow(value - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, value) => sum + value, 0) / prices.length;
  return Math.sqrt(variance);
};

const fetchCryptoData = async () => {
  const coins = ["bitcoin", "matic-network", "ethereum"];
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: coins.join(","),
          vs_currencies: "usd",
          include_market_cap: true,
          include_24hr_change: true,
        },
      }
    );

    const coinData = coins.map((coin) => {
      const data = response.data[coin];
      return {
        name: coin,
        priceUSD: data.usd,
        marketCapUSD: data.usd_market_cap,
        change24h: data.usd_24h_change,
      };
    });

    return coinData;
  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error.message);
    throw new Error("Failed to fetch cryptocurrency data");
  }
};

const saveCryptoData = async (cryptoData) => {
  await Crypto.deleteMany(); // Clear old data
  await Crypto.insertMany(cryptoData); // Insert new data
};

const getCryptoStats = async (coin) => {
  try {
    const crypto = await Crypto.findOne({ name: coin });
    if (!crypto) {
      throw new Error("Cryptocurrency data not found");
    }

    return {
      price: crypto.priceUSD,
      marketCap: crypto.marketCapUSD,
      "24hChange": crypto.change24h,
    };
  } catch (error) {
    console.error("Error retrieving cryptocurrency stats:", error.message);
    throw new Error("Failed to get cryptocurrency data");
  }
};

const getCryptoPriceDeviation = async (coin) => {
  try {
    const prices = await Crypto.find({ name: coin })
      .sort({ updatedAt: -1 }) // Sort by most recent data
      .limit(100) // Get the last 100 records
      .select("priceUSD"); // Only retrieve the price

    const priceValues = prices.map((record) => record.priceUSD);
    if (priceValues.length < 2) {
      // Calculate the next fetch time (assuming the background job runs every 2 hours)
      const nextFetchTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const formattedTime = nextFetchTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        message: `Not enough data to calculate standard deviation. Please try again later after ${formattedTime} when more data is collected.`,
      };
    }

    const deviation = calculateStandardDeviation(priceValues);
    return { deviation: deviation.toFixed(2) };
  } catch (error) {
    console.error("Error calculating standard deviation:", error.message);
    throw new Error("Failed to calculate cryptocurrency price deviation");
  }
};

module.exports = {
  fetchCryptoData,
  saveCryptoData,
  getCryptoStats,
  getCryptoPriceDeviation,
};
