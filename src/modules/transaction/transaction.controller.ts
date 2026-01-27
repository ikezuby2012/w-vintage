import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, {Types} from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as transactionService from "./transaction.service";
import * as accountService from "../account/account.service";
import Transaction from "./transaction.model";
import { v4 as uuidv4 } from 'uuid';


export const createTransaction = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { transactionType, amount } = req.body;

  const refNumber = uuidv4();

  const userAccount = await accountService.getAccountByUserId(new mongoose.Types.ObjectId(userId));
  if (!userAccount) {
    return next(new ApiError(httpStatus.NOT_FOUND, "User account not found"));
  }

  if (amount > userAccount.balance) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance to cover transfer fee"));
  }

  const currentBalance = userAccount.balance;
  let newBalance = currentBalance;
  const referenceNumber = uuidv4();

  if (transactionType == "DEPOSIT") {
    newBalance += amount;
  } else if (transactionType == "WITHDRAWAL") {
    newBalance -= amount;
  }

  const transaction = await transactionService.createTransaction({
    ...req.body,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    referenceNumber,
    accountId: userAccount._id
  });

  res.status(httpStatus.CREATED).json({
    status: "success",
    data: transaction,
  });
});

export const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["accountId", "transactionType", "status"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await transactionService.queryTransactions(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getTransaction = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transactionId === "string") {
    const transaction = await transactionService.getTransactionById(
      new mongoose.Types.ObjectId(req.params.transactionId)
    );
    if (!transaction) {
      throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: transaction,
    });
  }
});

export const updateTransaction = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transactionId === "string") {
    const transaction = await transactionService.updateTransactionById(
      new mongoose.Types.ObjectId(req.params.transactionId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: transaction,
    });
  }
});

export const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.transactionId === "string") {
    await transactionService.deleteTransactionById(
      new mongoose.Types.ObjectId(req.params.transactionId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const depositTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.body;

  /// check if accountId actually exist;
  const ifAccountExist = await accountService.getAccountByAccountNumber(accountId);

  if (!ifAccountExist) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Account not found!"))
  }

  const refNumber = transactionService.generateTransactionNumber();

  const transaction = await Transaction.create({
    transactionType: "DEPOSIT",
    amount: req.body.amount,
    currency: "BTC",
    accountId: req.body.accountId,
    referenceNumber: refNumber,
    status: "PENDING",
    description: req.body.description
  });

  res.status(httpStatus.CREATED).json({
    status: "success",
    data: transaction,
  });
});

export const getUserTransaction = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const userAccount = await accountService.getAccountByUserId(new mongoose.Types.ObjectId(userId));
  if (!userAccount) {
    return next(new ApiError(httpStatus.NOT_FOUND, "User account not found"));
  }

  const txn = await transactionService.queryTransactions(
    { accountId: new Types.ObjectId(userAccount._id) },
    {}
  );

  return res.status(httpStatus.OK).json({
    status: "success",
    data: txn,
  });
});