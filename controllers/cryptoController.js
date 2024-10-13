const axios = require("axios");
const Crypto = require("../models/cryptoSchema");

/**
 * Helper function to calculate the standard deviation of a set of prices.
 * @param {number[]} prices - An array of cryptocurrency prices.
 * @returns {number} The standard deviation of the prices.
 */
const calculateStandardDeviation = (prices) => {
  const mean = prices.reduce((sum, value) => sum + value, 0) / prices.length;
  const squaredDiffs = prices.map((value) => Math.pow(value - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, value) => sum + value, 0) / prices.length;
  return Math.sqrt(variance);
};

/**
 * Fetches the current price, market cap, and 24-hour change for specified cryptocurrencies from the CoinGecko API.
 * @async
 * @returns {Promise<Object[]>} An array of objects containing cryptocurrency data (name, price, market cap, and 24-hour change).
 * @throws Will throw an error if the data fetching from CoinGecko fails.
 */
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

/**
 * Saves cryptocurrency data to the database.
 * @async
 * @param {Object[]} cryptoData - An array of objects containing cryptocurrency data.
 * @returns {Promise<void>} A promise that resolves when the data is successfully saved.
 */
const saveCryptoData = async (cryptoData) => {
  await Crypto.deleteMany(); // Clear old data
  await Crypto.insertMany(cryptoData); // Insert new data
};

/**
 * Retrieves the latest statistics for a specific cryptocurrency.
 * @async
 * @param {string} coin - The name of the cryptocurrency (e.g., 'bitcoin', 'matic-network', 'ethereum').
 * @returns {Promise<Object>} An object containing the price, market cap, and 24-hour change of the cryptocurrency.
 * @throws Will throw an error if the cryptocurrency data is not found.
 */
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

/**
 * Calculates the standard deviation of the cryptocurrency's price for the last 100 records.
 * @async
 * @param {string} coin - The name of the cryptocurrency (e.g., 'bitcoin', 'matic-network', 'ethereum').
 * @returns {Promise<Object>} An object containing the standard deviation of the cryptocurrency's price or a message indicating insufficient data.
 * @throws Will throw an error if the standard deviation calculation fails.
 */
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
