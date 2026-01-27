import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as userService from "./user.service";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  res
    .status(httpStatus.NOT_FOUND)
    .send("pls use the /auth/signup route instead");
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["name", "role"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await userService.queryUsers(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.userId === "string") {
    const user = await userService.getUserById(
      new mongoose.Types.ObjectId(req.params.userId)
    );
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: user,
    });
  }
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.userId === "string") {
    const user = await userService.updateUserById(
      new mongoose.Types.ObjectId(req.params.userId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: user,
    });
  }
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.userId === "string") {
    await userService.deleteUserById(
      new mongoose.Types.ObjectId(req.params.userId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});