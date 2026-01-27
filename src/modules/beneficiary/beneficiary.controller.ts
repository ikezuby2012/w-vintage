import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as beneficiaryService from "./beneficiary.service";

export const createBeneficiary = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id || req.body.userId;

  const beneficiary = await beneficiaryService.createBeneficiary({
    ...req.body,
    userId: new Types.ObjectId(userId),
  });

  if (!beneficiary) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Unable to create beneficiary"));
  }

  return res.status(httpStatus.CREATED).json({
    status: "success",
    message: "Beneficiary Created Successfully",
    data: beneficiary
  });
});

export const getBeneficiaries = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["userId", "isFavorite", "country", "currency"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await beneficiaryService.queryBeneficiaries(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getBeneficiary = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.beneficiaryId === "string") {
    const beneficiary = await beneficiaryService.getBeneficiaryById(
      new mongoose.Types.ObjectId(req.params.beneficiaryId)
    );
    if (!beneficiary) {
      throw new ApiError(httpStatus.NOT_FOUND, "Beneficiary not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: beneficiary,
    });
  }
});

export const updateBeneficiary = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.beneficiaryId === "string") {
    const beneficiary = await beneficiaryService.updateBeneficiaryById(
      new mongoose.Types.ObjectId(req.params.beneficiaryId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: beneficiary,
    });
  }
});

export const deleteBeneficiary = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.beneficiaryId === "string") {
    await beneficiaryService.deleteBeneficiaryById(
      new mongoose.Types.ObjectId(req.params.beneficiaryId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const getUserBeneficiaries = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const beneficiaries = await beneficiaryService.queryBeneficiaries(
    { userId: new Types.ObjectId(userId) },
    {}
  );

  return res.status(httpStatus.OK).json({
    status: "success",
    data: beneficiaries,
  });
});