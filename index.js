const express = require("express");
const { PORT } = require("./constants");
const cors = require("cors");
const errorHandler = require("./middleware/errorhandler");
const notFound = require("./middleware/notFound");
const connectDB = require("./config/db");
const colors = require('colors')

const app = express();
connectDB()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("API is running");
});

//call your routes here
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes')

// routes
app.use('/api/user', userRoutes);
app.use("/api/chat", chatRoutes);


app.use(errorHandler);
app.use(notFound);

const server = app.listen(PORT, () => console.log(`server started on port ${PORT}`.yellow.bold));

process.on("unhandledRejection", (err) => {
  server.close(() => process.exit(1));
});
