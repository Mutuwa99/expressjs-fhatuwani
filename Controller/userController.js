const User = require("../Models/userModel");
const CatchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = CatchAsync(async (req, res) => {
  console.log("your're in the correct file");
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = CatchAsync(async (req, res, next) => {
  //(1) Create Error if User Posts password Data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This Route is not for password updates, please use 'UpdatePassword'",
        400
      )
    );
  }

  //(2) Filtered out Unwanted fields names that are not allowed to be updates
  const filterBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

exports.getUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No document found with that ID"), 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});
