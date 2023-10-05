const mongoose = require("mongoose");
const { MONGO_URL } = require("../constants");
const connectDB = async () => {
  try {
    const con = await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected...${con.connection.host}`.cyan.underline);
  } catch (err) {
    console.log(`Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
