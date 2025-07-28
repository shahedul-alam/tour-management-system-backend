/* eslint-disable no-console */
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { envVars } from "./app/config/env";

dotenv.config();
let server: Server;

const startServer = async () => {
  try {
    // connecting to mongodb using mongoose
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB using Mongoose");

    // listening the server on post 5000
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();

/* The `process.on("SIGTERM", ...)` block in the provided TypeScript code is handling the SIGTERM
signal. When a SIGTERM signal is received, it indicates a request for the process to terminate
gracefully. In this block: */
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Server is shutting down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

/* The `process.on("unhandledRejection", ...)` block in the provided TypeScript code is handling
unhandled promise rejections in the application. When a promise is rejected but no error handler is
attached to it, it becomes an unhandled rejection. In this block: */
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

/* The `process.on("uncaughtException", ...)` block in the provided TypeScript code is handling
uncaught exceptions in the application. An uncaught exception occurs when an error is thrown but not
caught by any try/catch block or error handler. */
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
