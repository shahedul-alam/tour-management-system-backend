import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/appError";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        throw new AppError(httpStatus.NOT_FOUND, "Token not found");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserEXists = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserEXists) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (!isUserEXists.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
      }

      if (
        isUserEXists.isActive === IsActive.BLOCKED ||
        isUserEXists.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserEXists.isActive}`
        );
      }

      if (isUserEXists.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden access");
      }

      req.tokenUser = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
