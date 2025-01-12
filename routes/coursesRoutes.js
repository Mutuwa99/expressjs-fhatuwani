const express = require("express");
const {
  getAllCourses,
  createCourse,
} = require("../Controller/coursesController");

const router = express.Router();

router.get("/getAllCourses", getAllCourses);
router.post("/addCourse", createCourse);

module.exports = router;
