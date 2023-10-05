const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { MESSAGES } = require("../constants");
const { generateToken } = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error(MESSAGES.MISSING_FIELDS);
  }

  const userExsits = await User.findOne({ email });
  if (userExsits) {
    res.status(400);
    throw new Error(MESSAGES.USER_EXIST);
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
       const response =  user._doc;
      delete response.password;
    res.status(201).json({
      statusCode: 201,
      message: MESSAGES.USER_CREATED,
      data: { ...response, token: generateToken(user._id) },
    });
  } else {
    res.status(400);
    throw new Error(MESSAGES.USER_FAILED);
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error(MESSAGES.MISSING_FIELDS);
  }

  const userExsits = await User.findOne({ email });

  const passwordMatch = await userExsits.matchPassword(
    password,
    userExsits.password
  );
  if (userExsits && passwordMatch) {
    delete userExsits._doc.password;
    res.status(201).json({
      statusCode: 201,
      message: MESSAGES.USER_CREATED,
      data: { ...userExsits._doc, token: generateToken(userExsits._id) },
    });
  } else {
    res.status(401);
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(201).json({
    statusCode: 201,
    message: MESSAGES.FETCHED,
    data: users,
  });
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
};
