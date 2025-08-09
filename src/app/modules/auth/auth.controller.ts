/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await authServices.credentialsLogin(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: loginInfo,
    });
  }
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies"
      );
    }

    const tokenInfo = await authServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "New access token retrieved successfully",
      data: tokenInfo,
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await authServices.resetPassword(oldPassword, newPassword, decodedToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password changed successfully",
      data: null,
    });
  }
);

export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
};
