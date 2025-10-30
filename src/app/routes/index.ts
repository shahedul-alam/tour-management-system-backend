import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OtpRoutes } from "../modules/otp/otp.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
  {
    path: "/tour",
    route: TourRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));
