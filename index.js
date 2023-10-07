const express = require("express");
const { PORT } = require("./constants");
const cors = require("cors");
const errorHandler = require("./middleware/errorhandler");
const notFound = require("./middleware/notFound");
const connectDB = require("./config/db");
const colors = require('colors');
const path = require('path')

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
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes')

// routes
app.use('/api/user', userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);




if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) =>
    res.redirect("https://mellifluous-gingersnap-277881.netlify.app/")
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}


app.use(errorHandler);
app.use(notFound);

const server = app.listen(PORT, () => console.log(`server started on port ${PORT}`.yellow.bold));

process.on("unhandledRejection", (err) => {
  server.close(() => process.exit(1));
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
   origin: "*",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});