import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IsActive } from "../user/user.interface";
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserEXists = await User.findOne({ email });

//   if (!isUserEXists) {
//     throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserEXists.password as string
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
//   }

//   const userTokens = createUserTokens(isUserEXists);

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { password: pass, ...rest } = isUserEXists.toObject();

//   return {
//     ...userTokens,
//     user: rest,
//   };
// };

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

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOldPasswordMatched = await bcryptjs.compare(
    oldPassword,
    user?.password as string
  );

  if (!isOldPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user.password = await bcryptjs.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

  user?.save();

  return true;
};

const resetPassword = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  decodedToken: JwtPayload
) => {
  if (payload.id != decodedToken.userId) {
    throw new AppError(401, "You can not reset your password");
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.password = await bcryptjs.hash(payload.newPassword, envVars.BCRYPT_SALT_ROUND);

  user?.save();

  return true;
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (
    user.password &&
    user.auths.some((providerObjects) => providerObjects.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set your password. Now you can change the password from your profile."
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    envVars.BCRYPT_SALT_ROUND
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = hashedPassword;
  user.auths = auths;

  await user.save();
};

const forgotPassword = async (email: string) => {
  if (!email) {
    throw new AppError(httpStatus.NOT_FOUND, "Email not found");
  }

  const isUserEXists = await User.findOne({ email });

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

  const jwtPayload = {
    userId: isUserEXists._id,
    email: isUserEXists.email,
    role: isUserEXists.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserEXists._id}&token=${resetToken}`;

  sendEmail({
    to: isUserEXists.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserEXists.name,
      resetUILink,
    },
  });
};

export const authServices = {
  // credentialsLogin,
  getNewAccessToken,
  changePassword,
  resetPassword,
  setPassword,
  forgotPassword,
};
