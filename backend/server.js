require("dotenv").config();
require("express-async-errors");
const app = require("./app");
const connectDB = require("./src/config/database");
const logger = require("./src/utils/logger.js");

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

const server = app.listen(PORT, async () => {
  await connectDB();
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated!");
  });
});
