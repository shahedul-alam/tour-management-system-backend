import express, { Application, Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { routeNotFoundHandler } from "./app/middlewares/notFoundHandler";

// creating an app using express
const app: Application = express();

// middlewares
app.use(express.json());
app.use(cors());

// router
app.use("/api/v1", router);

// entry point of the server
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the tour management system server");
});

// global error handler
app.use(globalErrorHandler);

// route not found handler
app.use(routeNotFoundHandler);

export default app;
