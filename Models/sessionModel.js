const { default: mongoose } = require("mongoose");

const sessionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Name of Student is required"],
  },
  tutorName: {
    type: String,
  },
  date_time: {
    type: Date,
    required: [true, "Date of session is required"],
  },
  sessionSummary: {
    type: String,
    required: [true, "Summary of session is required"],
  },
});

const Sessions = mongoose.model("Sessions", sessionSchema);

module.exports = Sessions;
