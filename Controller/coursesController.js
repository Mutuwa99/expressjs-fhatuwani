const CatchAsync = require("../utils/CatchAsync");
const course = require("../Models/courseModel");

exports.getAllCourses = CatchAsync(async (req, res, next) => {
  const courses = await course.find();
  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      courses,
    },
  });
});

exports.createCourse = CatchAsync(async (req, res, next) => {
  const newCourse = await course.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      course: newCourse,
    },
  });
});
