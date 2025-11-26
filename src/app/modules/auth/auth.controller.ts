/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Authentication service error."
          )
        );
      }

      if (!user) {
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            info.message || "Invalid credentials."
          )
        );
      }

      // stateful session
      // req.login(user, (loginErr) => {
      //   if (loginErr) {
      //     return next(
      //       new AppError(
      //         httpStatus.INTERNAL_SERVER_ERROR,
      //         "Error establishing session."
      //       )
      //     );
      //   }

      //   const userTokens = createUserToken(user);

      //   setAuthCookie(res, userTokens);

      //   const userObject = user.toObject();
      //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //   const { password, ...rest } = userObject;

      //   sendResponse(res, {
      //     success: true,
      //     statusCode: httpStatus.OK,
      //     message: "User logged in successfully",
      //     data: {
      //       accessToken: userTokens.accessToken,
      //       refreshToken: userTokens.refreshToken,
      //       user: rest,
      //     },
      //   });
      // });

      const userTokens = createUserTokens(user);

      setAuthCookie(res, userTokens);

      const userObject = user.toObject();
      const { password, ...rest } = userObject;

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

const googleInitiate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      state: redirect as string,
    })(req, res, next);
  }
);

const googleCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const redirectTo = req.query.state;

    passport.authenticate(
      "google",
      // { session: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: any, user: any, info: any) => {
        if (err || !user) {
          // Redirect back to the client login page with an error flag
          const errorMessage = err
            ? "Server error during login."
            : info?.message || "Authentication failed.";
          return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=${encodeURIComponent(
              errorMessage
            )}`
          );
        }

        // stateful session
        // req.login(user, (loginErr) => {
        //   if (loginErr) {
        //     return next(
        //       new AppError(
        //         httpStatus.INTERNAL_SERVER_ERROR,
        //         "Error establishing session."
        //       )
        //     );
        //   }

        //   const userTokens = createUserToken(user);

        //   setAuthCookie(res, userTokens);

        //   const redirectURL = `${envVars.FRONTEND_URL}${redirectTo}?accessToken=${userTokens.accessToken}`;

        //   return res.redirect(redirectURL);
        // });

        const userTokens = createUserTokens(user);

        setAuthCookie(res, userTokens);

        const userObject = user.toObject();
        const { password, ...rest } = userObject;

        sendResponse(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "User logged in successfully",
          data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user: rest,
          },
        });
      }
    )(req, res, next);
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

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.tokenUser;

    await authServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password changed successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.tokenUser;

    await authServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password changed successfully",
      data: null,
    });
  }
);

const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const decodedToken = req.tokenUser as JwtPayload;

    await authServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password set successfully",
      data: null,
    });
  }
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await authServices.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Email sent successfully",
      data: null,
    });
  }
);

export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  changePassword,
  resetPassword,
  setPassword,
  forgotPassword,
  googleInitiate,
  googleCallback,
};
