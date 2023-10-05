const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { MESSAGES } = require("../constants");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.status(201).json({
      statusCode: 201,
      message: MESSAGES.FETCHED,
      data: isChat[0],
    });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(201).json({
        statusCode: 201,
        message: MESSAGES.FETCHED,
        data: FullChat,
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
          res.status(201).json({
            statusCode: 201,
            message: MESSAGES.FETCHED,
            data: results,
          });
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getChat = asyncHandler(async (req, res) => {});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

      res.status(201).json({
        statusCode: 201,
        message: MESSAGES.FETCHED,
        data: fullGroupChat,
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {});

const renameFromGroup = asyncHandler(async (req, res) => {});

const addToGroup = asyncHandler(async (req, res) => {});

module.exports = {
    fetchChats,
  accessChat,
  getChat,
  createGroupChat,
  renameGroupChat,
  renameFromGroup,
  addToGroup,
};
