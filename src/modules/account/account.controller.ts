import httpStatus from "http-status";
import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as accountService from "./account.service";
import * as transactionService from "../transaction/transaction.service";
import { v4 as uuidv4 } from 'uuid';
import { NewCreatedTransaction } from "modules/transaction/transaction.interfaces";

export const createAccount = catchAsync(async (req: Request, res: Response) => {
  const account = await accountService.createAccount(req.body);
  res.status(httpStatus.CREATED).json({
    status: "success",
    data: account,
  });
});

export const getAccounts = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["userId", "accountType", "status"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await accountService.queryAccounts(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getAccount = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.accountId === "string") {
    const account = await accountService.getAccountById(
      new mongoose.Types.ObjectId(req.params.accountId)
    );
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: account,
    });
  }
});

export const updateAccount = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.accountId === "string") {
    const account = await accountService.updateAccountById(
      new mongoose.Types.ObjectId(req.params.accountId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Account updated successfully",
      data: account,
    });
  }
});

export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.accountId === "string") {
    await accountService.deleteAccountById(
      new mongoose.Types.ObjectId(req.params.accountId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const GetAccountInfo = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const id = req.user?._id;

  const account = await accountService.getAccountByUserId(new Types.ObjectId(id));

  if (!account) {
    return next(new ApiError(404, "No Account was found"));
  }

  return res.status(httpStatus.OK).json({
    status: "success",
    data: { account, user: req.user },
  })
});

export const verifyAccount = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const id = req.params.accountId;

  const account = await accountService.getAccountById(id);

  if (!account) {
    return next(new ApiError(404, "No Account was found"));
  }

  if (account.isVerified) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Account is already verified"));
  }

  const depositAmount = 50000;
  const referenceNumber = uuidv4();

  const currentBalance = account.balance;
  const newBalance = currentBalance + depositAmount;

  const updatedAccount = await accountService.updateAccountById(new mongoose.Types.ObjectId(id), {
    isVerified: true,
    status: "ACTIVE",
    balance: newBalance
  });

  const transactionData: NewCreatedTransaction = {
    transactionType: "DEPOSIT",
    amount: depositAmount,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    currency: "USD",
    accountId: account.id,
    referenceNumber: referenceNumber,
    status: "COMPLETED",
    description: "Account verification bonus deposit"
  };

  const transaction = await transactionService.createTransaction(transactionData);

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Account verified successfully",
    data: {
      account: updatedAccount,
      transaction: transaction,
      newBalance: newBalance
    }
  });

});

export const updateAccountStatus = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const { accountId } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["PENDING", "ACTIVE", "FROZEN", "SUSPENDED"];

  if (!accountId) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Account ID is required"));
  }

  if (!status) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Status is required"));
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Invalid status value"));
  }

  const account = await accountService.getAccountById(accountId);

  if (!account) {
    return next(new ApiError(404, "No Account was found"));
  }

  let updateData: any = {};

  if (status === "ACTIVE") {
    updateData = {
      isActive: true,
      status: "ACTIVE"
    };
  } else {
    updateData = {
      isActive: false,
      status,
    };
  }

  const updatedAccount = await accountService.updateAccountById(
    new mongoose.Types.ObjectId(accountId),
    updateData
  );

  res.status(httpStatus.OK).json({
    status: "success",
    message: `Account status updated to ${status}`,
    data: updatedAccount
  });
})