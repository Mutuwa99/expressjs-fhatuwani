const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const CatchAsync = require("../utils/CatchAsync");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your Name"],
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please Provide an  Email"],
    validate: [validator.isEmail, "Enter a valid Email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please Enter your Password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Confirm your Password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not Matching",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResertExpires: Date,
  role: {
    type: String,
    enum: ["student", "StudentTutor"],
    default: "student",
  },
  summary: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
    },
  ],
});

//=================Encrypting password==================//

UserSchema.pre("save", async function (next) {
  //Only run if this function is modified
  if (!this.isModified("password")) return next();

  //Hash the passwordConfirm with cost of 12

  this.password = await bcrypt.hash(this.password, 12);

  //Delete PasswordConfirm field

  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  console.log("Hello there");
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(JWTTimestamp < changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  return false; // Password Not changed
};

UserSchema.pre(/^find/, function (next) {
  //This points to the current query
  this.find({ active: true });
  next();
});

//=============================Implementing password================//

UserSchema.methods.createPasswordResetToken = function () {
  //Generate Our token

  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResertExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;

//--------------------------Protecting Routes-------------------//
