import httpStatus from "http-status";
import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as accountService from "./account.service";

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
})
