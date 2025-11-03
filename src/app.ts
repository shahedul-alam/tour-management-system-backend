import express, { Application, Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { routeNotFoundHandler } from "./app/middlewares/notFoundHandler";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import { envVars } from "./app/config/env";

// creating an app using express
const app: Application = express();

// middlewares
app.use(
  expressSession({
    secret: "your secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);

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
