// controllers/cryptoController.js
const axios = require("axios");
const Crypto = require("../models/cryptoSchema");

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

module.exports = {
  fetchCryptoData,
  saveCryptoData,
};
