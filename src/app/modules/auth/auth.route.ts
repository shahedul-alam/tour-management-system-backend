import { Router } from "express";
import { authControllers } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", authControllers.credentialsLogin);
authRoutes.post("/refresh-token", authControllers.getNewAccessToken);
