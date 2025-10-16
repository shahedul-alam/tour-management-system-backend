import { Router } from "express";
import { userControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

export const userRoutes = Router();

userRoutes.post(
  "/register",
  validateRequest(createUserZodSchema),
  userControllers.createUser
);
userRoutes.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe);

userRoutes.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  userControllers.getSingleUser
);

userRoutes.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  userControllers.updateUser
);

userRoutes.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userControllers.getAllUsers
);
