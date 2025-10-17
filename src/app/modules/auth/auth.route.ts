import { NextFunction, Request, Response, Router } from "express";
import { authControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

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
authRoutes.post(
  "/forgot-password",
  authControllers.forgotPassword
);
authRoutes.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  authControllers.resetPassword
);
authRoutes.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  authControllers.googleCallback
);
