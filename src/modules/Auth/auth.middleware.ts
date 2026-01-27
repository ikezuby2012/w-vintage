import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { promisify } from "util";
import { User } from "../user";
import ApiError from "../errors/ApiError";
import catchAsync from "../utils/catchAsync";
import config from "../../config";
import { roleRights } from "../../config/roles";
// import { verifyToken } from "../token/token.service";

const { secret } = config.jwt;

export const protect = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    let token: any;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new ApiError(401, "You are not logged in! Please log in to get access.")
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, secret);
    // console.log("decoded ", decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    // console.log(currentUser);

    if (!currentUser) {
      return next(
        new ApiError(
          401,
          "The user belonging to this token does no longer exist."
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (await currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new ApiError(
          401,
          "User recently changed password! Please log in again."
        )
      );
    }

    // 5) check is user is verified
    if (!currentUser.isEmailVerified) {
      return next(
        new ApiError(401, "User is not yet verified, please verify account.")
      );
    }

    console.log("got here");

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

export const checkRoles = (accessRight: string) => {
  return (req: Request | any, res: Response, next: NextFunction) => {
    const accessRights = roleRights.get(req.user.accessRole) as string[];
    if (!accessRights.includes(accessRight)) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access right")
      );
    }
    // If everything is okay, proceed to the next middleware or route handler
    next();
  };
};

// export const restrictRoles = (...role) => {

// }