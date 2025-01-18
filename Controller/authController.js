const User = require("../Models/userModel");
const crypto = require("crypto");
const { isMongoId } = require("validator");
const CatchAsync = require("../utils/CatchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure;

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

//********************This is the mdoule for  creating new App User******************************
exports.signUp = CatchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    active: req.body.active,
  });

  createSendToken(newUser, 201, res);
});

//*****************//

exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("SignIn request received:", req.body);
  //*****************Checking iF Email And Password exist */
  if (!email || !password) {
    return AppError("please provide email or password", 400);
  }

  //***************Checking if User Exist & password  is correct */
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //-----------------------If everything is okay------------

  createSendToken(user, 200, res);
});

exports.forgotPassword = CatchAsync(async (req, res, next) => {
  // Getting user bassed on the posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("User Does not exist", 404));
  }

  //(2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  //(3) Send Token Via Email

  const resetURL = `${req.protocol}://${process.env.IP_ADDRESS}:${process.env.PORT}/app/v1/users/forgotpassword/${resetToken}`;

  const message = `Forgot your password Submit a PATCH request with your new password and 
  password confirm to ${resetURL}.\n If you didn't forget password please Ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset Token is only valid for 10 minutes",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to Email",
    });
  } catch (err) {
    (user.createPasswordResetToken = undefined),
      (user.passwordResertExpires = undefined);
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("The was an Error sending the Email, try again later"),
      500
    );
  }
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
  //(1)---- Getting user Based on Token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResertExpires: { $gt: Date.now() },
  });

  //(2) If token has not expired and there is user, set nw password

  if (!user) {
    return next(new AppError("Token is invalid or has expired"));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResertExpires = undefined;

  await user.save();

  // Log the User in and send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = CatchAsync(async (req, res, next) => {
  //Getting user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if posted password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return new AppError("Your current password is wrong", 401);
  }

  // If so update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  createSendToken(user, 200, res);
});

exports.protect = CatchAsync(async (req, res, next) => {
  //(1) Get Token And see if It's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You're not logged In!", 401));
  }

  //(2) Verification the Token

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // (3) iF Everything okay check if user still exisits

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError("User belonging to token no longer Exist", 401));
  }

  //(4) Check if User changed password after token has been issued.

  if (currentUser.passwordChangedAfter(decode.iat)) {
    return next(new AppError("Password Changed login again", 401));
  }

  req.user = currentUser;
  next();
});
