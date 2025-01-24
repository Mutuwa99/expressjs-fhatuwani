const CatchAsync = require("../utils/CatchAsync");
const Course = require("../Models/courseModel");
const {
  getAll,
  createOne,
  updateOne,
  getOne,
  deleteOne,
} = require("./handleFactory");
const Courses = require("../Models/courseModel");
const User = require("../Models/userModel");

exports.createCourse = CatchAsync(async (req, res, next) => {
  const newCourse = await Courses.create(req.body);
  const savedCourse = await newCourse.save();

  await User.findByIdAndUpdate(req.user.id, {
    $push: {
      courses: savedCourse._id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      newCourse,
    },
  });
});

exports.getAllCourses = getAll(Course);

exports.updateCourse = updateOne(Course); // Ensure the correct function name is used
exports.getOneCourse = getOne(Course);
exports.deleteCourse = deleteOne(Course);
