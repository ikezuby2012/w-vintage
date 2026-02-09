import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import httpStatus from "http-status";
import { catchAsync } from "../utils";
import { User } from "../user";

import { generateOtp } from "../../services/otp/otp.service";
import { createSendToken } from "../token/token.service";
import * as authService from "./auth.service";
import { logger } from "../logger";
import {
  sendOtpEmail,
  sendPasswordReset,
  sendPasswordResetAdmin
} from "../../services/email/email.service";
import { IUserDoc } from "../user/user.interfaces";
import { ApiError } from "../errors";
import { generateAccountNumber, getUserById } from "../user/user.service";
import { Account, accountService } from "../account";

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, name } = req.body;
  let createdUser;

  try {
    const otp = generateOtp();
    console.log(`Generated OTP: ${otp}`);

    // 1. Create user first (no transaction)
    createdUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      phoneNumber: req.body.phoneNumber,
      otp,
      country: req.body.country,
      otpExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    console.log('User created:', createdUser._id);

    let accountNumber;
    let isUnique = false;

    console.log('Starting account number generation');

    // 2. Generate unique account number (without transaction session)
    for (let attempts = 0; attempts < 10; attempts++) { // Increased attempts
      accountNumber = generateAccountNumber();
      console.log(`Generated account number attempt ${attempts + 1}: ${accountNumber}`);

      const existing = await Account.findOne({ accountNumber }).lean();
      if (!existing) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      // Rollback: Delete the user since we couldn't create account
      await User.findByIdAndDelete(createdUser._id);
      return next(new ApiError(400, 'Failed to generate unique account number after multiple attempts'));
    }

    // 3. Create account (without transaction)
    await Account.create({
      accountNumber,
      userId: createdUser._id,
      accountType: 'SAVINGS',
      balance: 0.00,
      transactionPin: req.body.transactionPin || '0000',
      isActive: true,
      isVerified: false,
      status: 'PENDING',
      currency: req.body.currency || 'USD',
      isSoftDeleted: false,
      btcBalance: 0.00,
    });

    console.log('Account created successfully for user:', createdUser._id);

    // 4. Send OTP email (non-critical operation)
    try {
      await sendOtpEmail(email, name, otp);
    } catch (emailErr) {
      logger.error(`Email failed for ${email}: ${emailErr}`);
      // Don't fail registration if email fails
    }

    // 5. Send response
    res.status(httpStatus.CREATED).json({
      status: "success",
      data: createdUser,
    });

  } catch (err: any) {
    console.log('Error during registration:', err);
    logger.error(`${err.message}`, "Registration failed");

    // Cleanup: If user was created but account creation failed
    if (createdUser && createdUser._id) {
      try {
        await User.findByIdAndDelete(createdUser._id);
        console.log('Cleaned up user due to registration failure');
      } catch (cleanupErr) {
        logger.error(`Cleanup failed for user ${createdUser._id}: ${cleanupErr}`);
      }
    }

    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong during registration"));
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  const account = await accountService.getAccountByUserId(new mongoose.Types.ObjectId(user._id));

  if (!account) {
    return next(new ApiError(404, "No Account was found"));
  }

  if (account.status === "SUSPENDED") {
    return next(new ApiError(httpStatus.FORBIDDEN, "Dear Customer, we have discovered suspicious activities on your account. An unauthorized IP address attempted to carry out a transaction on your account and credit card. Consequently, your account has been flagged by our risk assessment department. kindly visit our nearest branch with your identification card and utility bill to confirm your identity before it can be reactivated. For more information, kindly contact our online customer care representative at info@wealthvintage.com"));
  }
  
  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id, otp } = req.body;
  const user = await getUserById(id);

  if (!user) {
    return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
  }

  if (user.otpExpires && user.otpExpires < new Date()) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "OTP has expired"));
  }

  const verifiedUser = await authService.verifyUserEmail(id, otp);

  createSendToken(verifiedUser!, 200, req, res);
});

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

export const regenerateOtp = catchAsync(async (req: Request, res: Response) => {
  const otp = generateOtp();
  const { id } = req.params;

  const user = (await authService.regenerateNewOtp(id, otp)) as IUserDoc;

  // send otp to user
  try {
    sendOtpEmail(user.email, user.name, otp);
  } catch (err: any) {
    logger.error(`${err.message}`, "email could not be sent");
  }

  res.status(httpStatus.OK).json({
    status: "success",
    otp,
    data: user,
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError(404, "There is no user with email address."));
    }

    // 2) Generate the random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // console.log(resetToken, ": reset token");

    // send it to user email
    try {
      sendPasswordReset(req.body.email, resetToken);

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          "There was an error sending the email. Try again later"
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get the otp
    const { otp } = req.body;
    const token = otp;
    // get user based on reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(
        new ApiError(httpStatus.NOT_FOUND, "Token is invalid or has expired")
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
  }
);

export const ResetUserPassword = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const newPassword = authService.generateDefaultPassword();

    if (!newPassword) {
      return next(
        new ApiError(httpStatus.BAD_REQUEST, "New password is required")
      );
    }

    const user = await authService.resetPassword(userId, newPassword);

    if (!user) {
      return next(
        new ApiError(httpStatus.NOT_FOUND, "User not found")
      );
    }

    try {
      await sendPasswordResetAdmin(user.name, user.email, newPassword);
    } catch (emailErr) {
      logger.error(`Email failed for ${user.email}: ${emailErr}`);
      // Don't fail registration if email fails
    }

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Password reset successfully"
    });
  }
);

export const AdminViewUserPassword = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await authService.GetUserForAdminPasswordView(userId);

    if (!user || !user.adminOnlyView) {
      return next(
        new ApiError(httpStatus.NOT_FOUND, "Password not available")
      );
    }

    console.log(user.adminOnlyView);

    const decryptedPassword = authService.decryptPassword(user.adminOnlyView as string);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        userId: user.id,
        password: decryptedPassword
      }
    });
  }
);
