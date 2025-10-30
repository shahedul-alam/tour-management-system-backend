import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OTPService } from "./opt.service";

const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  
  await OTPService.sendOTP(email, name);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP send successfully",
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});

export const OTPController = {
  sendOTP,
  verifyOTP,
};
