import express, { Router } from "express";
import { authController, authValidation } from "../../modules/Auth";
import { validate } from "../../modules/validate";

const router: Router = express.Router();

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);

router.post("/login", validate(authValidation.login), authController.login);
router.post("/logout", validate(authValidation.logout), authController.logout);
router.post(
  "/verify-email",
  validate(authValidation.verifyEmail),
  authController.verifyEmail
);

router.get("/resend-otp/:id", authController.regenerateOtp);
router.post("/forgotpassword", authController.forgotPassword);

router.post(
  "/resetpassword",
  validate(authValidation.resetPassword),
  authController.resetPassword
);

export default router;