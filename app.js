const express = require("express");
const app = express();
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./Controller/errorController");
app.use(express.json());

app.use(morgan("dev"));
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Hello from my own small App" });
// });

app.get("/api/v1/tutor", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      message: `Hello from the server on  Sunday`,
    },
  });
});

app.use("/app/v1/users", userRouter);

app.use(globalErrorHandler);
module.exports = app;
