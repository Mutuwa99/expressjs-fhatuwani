const { default: mongoose } = require("mongoose");

const CourseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, "Course must have a name"],
  },
  description: {
    type: String,
    trim: true,
  },
});

const Courses = mongoose.model("Courses", CourseSchema);
module.exports = Courses;
