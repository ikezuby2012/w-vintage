import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as transferService from "./transfer.service";
import * as accountService from "../account/account.service";
import * as otpRequestService from "../otpRequest/otpRequest.service";
import * as beneficiaryService from "../beneficiary/beneficiary.service";
import { v4 as uuidv4 } from 'uuid';
import Transfer  from "./transfer.model";


export const createTransfer = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { transactionPin, otp, saveAsBeneficiary } = req.body;

  const refNumber = uuidv4();

  // Check if fee is greater than user account balance
  const userAccount = await accountService.getAccountByUserId(new mongoose.Types.ObjectId(userId));
  if (!userAccount) {
    return next(new ApiError(httpStatus.NOT_FOUND, "User account not found"));
  }

  if (req.body.fee > userAccount.balance) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance to cover transfer fee"));
  }
  console.log(userAccount);
  // Validate transaction pin
  if (!transactionPin || transactionPin !== userAccount.transactionPin) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Invalid transaction pin"));
  }

  /* =========================
       4. Validate OTP (latest, unused)
    ========================== */

  const existingOtpRequests = await otpRequestService.queryOtpRequests(
    { userId, isUsed: false },
    { limit: 1, sortBy: "createdAt:desc" }
  );

  if (!existingOtpRequests.results || existingOtpRequests.results.length === 0) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "No valid OTP found for this transaction"));
  }

  const otpRequest: any = existingOtpRequests.results[0];

  // Check if OTP is expired
  if (new Date() > otpRequest.otpExpiredAt) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "OTP has expired"));
  }

  if (otpRequest.otp !== otp) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "OTP does not match"))
  }

  // Create transfer
  const transfer = await transferService.createTransfer({
    ...req.body,
    account: userAccount._id,
    referenceNumber: refNumber
  });

  // Mark OTP as used and verified
  await otpRequestService.updateOtpRequestById(otpRequest._id, {
    isUsed: true,
    verifiedAt: new Date()
  });

  if (saveAsBeneficiary) {
    await beneficiaryService.createBeneficiary({
      ...req.body,
      nickname: req.body.accountHolderName,
      userId: new Types.ObjectId(userId),
    });
  }
  return res.status(httpStatus.CREATED).json({
    status: "success",
    message: "Transfer created successfully.",
    data: transfer,
  });
});

// export const validateTransferOtp = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
//   const { transferId } = req.body;
//   const userId = req.user?._id;

//   // Check if an unused OTP exists for this transaction
//   const otpRequest = await otpRequestService.getOtpRequestByTransactionAndOtp(transferId, ""); // We don't need the OTP value, just check existence

//   // Actually, let me modify this to query for unused OTPs for the transaction
//   const existingOtpRequests = await otpRequestService.queryOtpRequests(
//     { transactionId, userId, isUsed: false },
//     { limit: 1, sortBy: "createdAt:desc" }
//   );

//   if (!existingOtpRequests.results || existingOtpRequests.results.length === 0) {
//     return next(new ApiError(httpStatus.BAD_REQUEST, "No valid OTP found for this transaction"));
//   }

//   const otpRequest = existingOtpRequests.results[0];

//   // Check if OTP is expired
//   if (new Date() > otpRequest.otpExpiredAt) {
//     return next(new ApiError(httpStatus.BAD_REQUEST, "OTP has expired"));
//   }

//   // Mark OTP as used and verified
//   await otpRequestService.updateOtpRequestById(otpRequest._id, {
//     isUsed: true,
//     verifiedAt: new Date()
//   });

//   // Update transfer status to COMPLETED
//   const transfer = await transferService.updateTransferById(
//     new mongoose.Types.ObjectId(transferId),
//     { status: "COMPLETED" }
//   );

//   return res.status(httpStatus.OK).json({
//     status: "success",
//     message: "Transfer completed successfully",
//     data: transfer,
//   });
// });

export const getTransfers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["fromAccountId", "toAccountId", "status", "type"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await transferService.queryTransfers(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getTransfer = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transferId === "string") {
    const transfer = await transferService.getTransferById(
      new mongoose.Types.ObjectId(req.params.transferId)
    );
    if (!transfer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Transfer not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: transfer,
    });
  }
});

export const updateTransfer = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transferId === "string") {
    const transfer = await transferService.updateTransferById(
      new mongoose.Types.ObjectId(req.params.transferId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: transfer,
    });
  }
});

export const deleteTransfer = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transferId === "string") {
    await transferService.deleteTransferById(
      new mongoose.Types.ObjectId(req.params.transferId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const getTransferStats = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await Transfer.aggregate([
      {
        $match: {
          isSoftDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          totalTransferVolume: { $sum: "$amount" },
          totalTransfers: { $sum: 1 },
          successfulTransfers: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0]
            }
          },
          failedTransfers: {
            $sum: {
              $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] ?? {
      totalTransferVolume: 0,
      totalTransfers: 0,
      successfulTransfers: 0,
      failedTransfers: 0
    };

    res.status(httpStatus.OK).json({
      status: "success",
      data: result
    });
  }
);
