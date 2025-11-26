import { authControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { Router } from "express";

export const authRoutes = Router();

authRoutes.post("/login", authControllers.credentialsLogin);
authRoutes.post("/refresh-token", authControllers.getNewAccessToken);
authRoutes.post("/logout", authControllers.logout);
authRoutes.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  authControllers.changePassword
);
authRoutes.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  authControllers.setPassword
);
authRoutes.post("/forgot-password", authControllers.forgotPassword);
authRoutes.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  authControllers.resetPassword
);
authRoutes.get("/google", authControllers.googleInitiate);
authRoutes.get("/google/callback", authControllers.googleCallback);
