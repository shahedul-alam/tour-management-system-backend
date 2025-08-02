import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

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

  const jwtPayload = {
    userId: isUserEXists._id,
    email: isUserEXists.email,
    role: isUserEXists.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken,
  };
};

export const authServices = {
  credentialsLogin,
};
