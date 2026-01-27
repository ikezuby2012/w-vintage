import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import { catchAsync, pick } from "../utils";
import ApiError from "../errors/ApiError";

import ReferralLink from "./referrallink.model";

import * as referralLinkService from "./referrallink.service";
import { IOptions } from "../paginate/paginate";
import { generate16DigitGUID } from "../../services/DynamicReferralLink/dynamicreferrallink.service";

export const createNewReferralLink = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { CourseId, AffliateId } = req.body;

    const newReferralLink = {
      CourseId,
      AffliateId,
      Link: generate16DigitGUID(),
    };

    const checkIfLinkExist = await referralLinkService.checkIfLinkExists(
      AffliateId,
      CourseId
    );

    if (checkIfLinkExist)
      return next(new ApiError(404, "Link for this Course already exist!"));

    const NewReferralLink = await ReferralLink.create(newReferralLink);

    res.status(httpStatus.OK).json({
      status: "success",
      data: NewReferralLink,
    });
  }
);

export const getAllReferralsLink = catchAsync(
  async (req: Request | any, res: Response) => {
    const options: IOptions = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "projectBy",
    ]);
    const result = await referralLinkService.queryDocs({}, options);

    res.status(httpStatus.OK).json({
      status: "success",
      data: result,
    });
  }
);
