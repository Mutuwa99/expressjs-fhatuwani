const express = require("express");
const {
  getAllCourses,
  updateCourse, // Ensure the correct function name is used
  getOneCourse,
  deleteCourse,
  createCourse,
} = require("../Controller/coursesController");
const { protect } = require("../Controller/authController");
const router = express.Router();

router.post("/addCourse", protect, createCourse);
router.get("/getAllCourses", getAllCourses);
router.patch("/updateCourse/:id", protect, updateCourse); // Ensure the correct function name is used
router.get("/getCourse/:id", protect, getOneCourse);
router.delete("/deleteCourse/:id", protect, deleteCourse);

module.exports = router;
