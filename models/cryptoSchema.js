// models/cryptoSchema.js
const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  marketCapUSD: { type: Number, required: true },
  change24h: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Crypto", cryptoSchema);
