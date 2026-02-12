/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import httpStatus from "http-status";
// import config from "../../config";
import { logger } from "../logger";
import ApiError from "./ApiError";

const handleCastErrorDB = (err: any) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new ApiError(httpStatus.NOT_FOUND, message);
};

const handleDuplicateErrorDB = (err) => {
  console.log(err);
  const message = `${err.keyValue.email} has already been used!. please use another value`;
  return new ApiError(httpStatus.NOT_FOUND, message);
};

const handleJWTError = () =>
  new ApiError(httpStatus.UNAUTHORIZED, "invalid token please login again");

const handleTokenExpiredError = () =>
  new ApiError(httpStatus.UNAUTHORIZED, "token has expired");

export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  //let error = { ...err };
  let error = err;

  error.message = err.message;
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

  if (!(error instanceof ApiError)) {
    console.log(error);
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;

    const message: string = error.message || `${httpStatus[statusCode]}`;
    error = new ApiError(statusCode, message, true, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (
  err: ApiError | any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode, message } = err;

  if ((process.env.NODE_ENV as string) === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...((process.env.NODE_ENV as string) === "development" &&
      _req.get("host")?.startsWith("localhost") && {
      stack: err.stack,
    }),
  };

  if ((process.env.NODE_ENV as string) === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
