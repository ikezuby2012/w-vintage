import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as otpRequestService from "./otpRequest.service";
import * as userService from "../user/user.service";
import { sendOtpRequestMail } from "../../services/email/email.service";
import { logger } from "../../modules/logger";
import { generateOtp } from "../../services/otp/otp.service";

export const createOtpRequest = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const otp = generateOtp();

  const user = await userService.getUserById(userId);

  if (!user) return next(new ApiError(httpStatus.NOT_FOUND, "unable to find user"))

  const otpRequest = await otpRequestService.createOtpRequest({
    ...req.body,
    otp,
    userId: new Types.ObjectId(userId),
    otpExpiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  if (!otpRequest) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Unable to create OTP request"));
  }

  try {
    await sendOtpRequestMail(user.email, user.name, otp);
  } catch (emailErr) {
    logger.error(`Email failed for ${user.email}: ${emailErr}`);
    // Don't fail registration if email fails
  }


  return res.status(httpStatus.CREATED).json({
    status: "success",
    message: "OTP Request Created Successfully",
    data: otpRequest
  });
});

export const getOtpRequests = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["userId", "purpose", "isUsed"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await otpRequestService.queryOtpRequests(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getOtpRequest = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.otpRequestId === "string") {
    const otpRequest = await otpRequestService.getOtpRequestById(
      new mongoose.Types.ObjectId(req.params.otpRequestId)
    );
    if (!otpRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "OTP request not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: otpRequest,
    });
  }
});

export const updateOtpRequest = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.otpRequestId === "string") {
    const otpRequest = await otpRequestService.updateOtpRequestById(
      new mongoose.Types.ObjectId(req.params.otpRequestId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: otpRequest,
    });
  }
});

export const deleteOtpRequest = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.otpRequestId === "string") {
    await otpRequestService.deleteOtpRequestById(
      new mongoose.Types.ObjectId(req.params.otpRequestId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const validateOtp = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const { transactionId, otp } = req.body;
  const userId = req.user?._id;

  const validation = await otpRequestService.validateOtp(transactionId, otp, userId);

  if (!validation.isValid) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired OTP"));
  }

  return res.status(httpStatus.OK).json({
    status: "success",
    message: "OTP validated successfully",
    data: validation.otpRequest
  });
});