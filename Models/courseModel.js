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
  price: {
    type: Number,
  },
  ratingsAvarage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1"],
    max: [5, "Rating must be below 5"],
  },
  educationLevel: {
    type: [String],
  },
});

const Courses = mongoose.model("Courses", CourseSchema);
module.exports = Courses;
