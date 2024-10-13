const mongoose = require("mongoose");
require("dotenv").config();

/**
 * @function connectDB
 * @description Establishes a connection to the MongoDB database using the connection string from the environment variables.
 * @returns {Promise<void>} A promise that resolves when the database connection is successfully established.
 * @throws Will log an error message and exit the process with a failure status if the connection to MongoDB fails.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
