const express = require("express");
const app = express();
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const courseRouter = require("./routes/coursesRoutes");
const globalErrorHandler = require("./Controller/errorController");
const cors = require("cors");

app.use(express.json());
//app.use(cors());
app.use(morgan("dev"));
//app.options("*", cors());
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Hello from my own small App soon to be bigger" });
});

app.use("/app/v1/users", userRouter);

app.use("/app/v1/courses", courseRouter);

app.use(globalErrorHandler);
module.exports = app;
