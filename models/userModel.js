const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: {
      type: String,
      default: "https://via.placeholder.com/100x100",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userModel.methods.matchPassword = async function (enteredPassword, password) {
    console.log(enteredPassword);
    console.log(password);
    return bcrypt.compare(enteredPassword, password);
};

userModel.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userModel);

module.exports = User;
