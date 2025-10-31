import express from 'express';
import { OTPController } from './opt.controller';

const router = express.Router();

router.post("/send", OTPController.sendOTP);
router.post("/verify", OTPController.verifyOTP);

export const OtpRoutes = router;