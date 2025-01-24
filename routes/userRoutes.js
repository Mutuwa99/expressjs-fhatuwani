const express = require("express");
const multer = require("multer");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require("../Controller/authController");
const {
  getAllUsers,
  getUser,
  getMe,
  updateMe,
} = require("../Controller/userController");

const upload = multer({ dest: "public/images/users" });
const router = express.Router();

router.post("/signup", signUp);
router.post("/signIn", login);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassword", protect, updatePassword);
router.patch("/updateme", protect, upload.single("photo"), updateMe);
router.get("/getusers", getAllUsers);

router.get("/me", protect, getMe);
router.get("/:id", getUser);

module.exports = router;
