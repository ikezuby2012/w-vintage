import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import config from "./config";
import logger from "./modules/logger/logger";

dotenv.config({ path: "../.env" });

const port = config.port || 5007;
const MONGODB_URL = config.mongoose.url;

const server = app.listen(port, () => {
  logger.info(`Listening to port ${port}`);
});

mongoose.connect(MONGODB_URL).then(() => {
  logger.info("Connected to MongoDB");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
