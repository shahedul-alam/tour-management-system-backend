import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/appError";

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

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden access");
      }

      // req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
