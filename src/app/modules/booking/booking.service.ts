/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import mongoose from "mongoose";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { generateTransactionId } from "../../utils/generateTransactionId";

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const session = await mongoose.startSession();

  try {
    const updatedBooking = await session.withTransaction(async () => {
      const transactionId = generateTransactionId();

      const user = await User.findById(userId).session(session);

      if (!user?.phone || !user?.address) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Please update your profile to book a tour."
        );
      }

      const tour = await Tour.findById(payload.tour)
        .select("costFrom")
        .session(session);

      if (!tour?.costFrom) {
        throw new AppError(httpStatus.BAD_REQUEST, "No tour cost found.");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const amount = Number(tour.costFrom) * Number(payload.guestCount)!;

      const [booking] = await Booking.create(
        [
          {
            user: userId,
            status: BOOKING_STATUS.PENDING,
            ...payload,
          },
        ],
        { session }
      );

      const [payment] = await Payment.create(
        [
          {
            booking: booking._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount,
          },
        ],
        { session }
      );

      const finalBooking = await Booking.findByIdAndUpdate(
        booking._id,
        {
          payment: payment._id,
        },
        { new: true, runValidators: true, session }
      )
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");

      const sslPayload: ISSLCommerz = {
        address: (finalBooking?.user as any).address,
        email: (finalBooking?.user as any).email,
        phoneNumber: (finalBooking?.user as any).phone,
        name: (finalBooking?.user as any).name,
        amount: amount,
        transactionId: transactionId,
      };

      const sslPayment = await SSLService.sslPaymentInit(sslPayload);

      return { paymentUrl: sslPayment.GatewayPageURL, booking: finalBooking };
    });

    return updatedBooking;
  } finally {
    session.endSession();
  }
};

const getUserBookings = async () => {
  return {};
};

const getBookingById = async () => {
  return {};
};

const updateBookingStatus = async () => {
  return {};
};

const getAllBookings = async () => {
  return {};
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
