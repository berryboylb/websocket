const express = require("express");
const {
  accessChat,
  getChat,
  createGroupChat,
  renameGroupChat,
  renameFromGroup,
  addToGroup,
  fetchChats,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroupChat);
router.route("/groupremove").put(protect, renameFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;
