import { Router } from "express";
import { PaymentController } from "./payment.controller";

export const PaymentRoutes = Router();

PaymentRoutes.post("/init-payment/:bookingId", PaymentController.initPayment);
PaymentRoutes.post("/success", PaymentController.successPayment);
PaymentRoutes.post("/fail", PaymentController.failPayment);
PaymentRoutes.post("/cancel", PaymentController.cancelPayment);
