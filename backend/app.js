const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const logger = require("./src/utils/logger");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
app.use(cors());

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// => Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Dev Logging...
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

// 404 handler
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

app.use(errorHandler);

module.exports = app;
