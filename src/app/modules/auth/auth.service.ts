import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const getNewAccessToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserEXists = await User.findOne({
    email: verifiedRefreshToken.email,
  });

  if (!isUserEXists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
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

  const newAccessToken = createNewAccessTokenWithRefreshToken(isUserEXists);

  return {
    accessToken: newAccessToken,
  };
};

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserEXists = await User.findOne({ email });

  if (!isUserEXists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserEXists.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
  }

  const userTokens = createUserTokens(isUserEXists);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserEXists.toObject();

  return {
    ...userTokens,
    user: rest,
  };
};

export const authServices = {
  credentialsLogin,
  getNewAccessToken,
};
