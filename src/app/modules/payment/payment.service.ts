/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { Payment } from "./payment.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Booking } from "../booking/booking.model";
import { BOOKING_STATUS } from "../booking/booking.interface";
import AppError from "../../errorHelpers/appError";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found. You have not booked this tour"
    );
  }

  const booking = await Booking.findById(payment.booking).populate(
    "user",
    "name email phone address"
  );

  const sslPayload: ISSLCommerz = {
    address: (booking?.user as any).address,
    email: (booking?.user as any).email,
    phoneNumber: (booking?.user as any).phone,
    name: (booking?.user as any).name,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return { paymentUrl: sslPayment.GatewayPageURL };
};

const successPayment = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();

  try {
    const bookingComplete = await session.withTransaction(async () => {
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: query.transactionId },
        {
          status: PAYMENT_STATUS.PAID,
        },
        { new: true, runValidators: true, session }
      );

      if (!updatedPayment) {
        throw new AppError(401, "Payment not found");
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        updatedPayment?.booking,
        {
          status: BOOKING_STATUS.COMPLETE,
        },
        { new: true, runValidators: true, session }
      )
        .populate("tour", "title")
        .populate("user", "name email");

      if (!updatedBooking) {
        throw new AppError(401, "Booking not found");
      }

      const invoiceData: IInvoiceData = {
        bookingDate: updatedBooking?.createdAt as Date,
        guestCount: updatedBooking?.guestCount,
        totalAmount: updatedPayment?.amount,
        tourTitle: (updatedBooking?.tour as unknown as ITour).title,
        transactionId: updatedPayment?.transactionId,
        userName: (updatedBooking?.user as unknown as IUser).name,
      };

      const pdfBuffer = await generatePdf(invoiceData);

      const cloudinaryResult = await uploadBufferToCloudinary(
        pdfBuffer,
        "invoice"
      );

      if (!cloudinaryResult) {
        throw new AppError(401, "Error uploading pdf");
      }

      await Payment.findByIdAndUpdate(
        updatedPayment._id,
        {
          invoiceUrl: cloudinaryResult?.secure_url,
        },
        { runValidators: true, session }
      );

      await sendEmail({
        to: (updatedBooking?.user as unknown as IUser).email,
        subject: "Your booking invoice",
        templateName: "invoice",
        templateData: invoiceData,
        attachments: [
          {
            filename: "invoice.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      return { success: true, message: "Payment completed successfully" };
    });

    return bookingComplete;
  } finally {
    session.endSession();
  }
};

const failPayment = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();

  try {
    const bookingFailed = await session.withTransaction(async () => {
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: query.transactionId },
        {
          status: PAYMENT_STATUS.FAILED,
        },
        { runValidators: true, session }
      );

      await Booking.findByIdAndUpdate(
        updatedPayment?.booking,
        {
          status: BOOKING_STATUS.FAILED,
        },
        { runValidators: true, session }
      );

      return { success: false, message: "Payment failed" };
    });

    return bookingFailed;
  } finally {
    session.endSession();
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();

  try {
    const bookingCancelled = await session.withTransaction(async () => {
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: query.transactionId },
        {
          status: PAYMENT_STATUS.CANCELLED,
        },
        { new: true, runValidators: true, session }
      );

      await Booking.findByIdAndUpdate(
        updatedPayment?.booking,
        {
          status: BOOKING_STATUS.CANCEL,
        },
        { new: true, runValidators: true, session }
      );

      return { success: false, message: "Payment cancelled" };
    });

    return bookingCancelled;
  } finally {
    session.endSession();
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");

  if (!payment) {
    throw new AppError(401, "Payment not found");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(401, "Invoice not available yet");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
};
