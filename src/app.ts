import express, { Application, NextFunction, Request, Response } from "express";

// creating an app using express
const app: Application = express();

// entry point of the server
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the tour management system server");
});

export default app;