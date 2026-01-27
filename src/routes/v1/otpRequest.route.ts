import express, { Router } from "express";
import { otpRequestController } from "../../modules/otpRequest";
import { auth } from "../../modules/Auth";
import validate from "../../modules/validate/validate.middleware";
import * as otpRequestValidation from "../../modules/otpRequest/otpRequest.validation";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    validate(otpRequestValidation.createOtpRequest),
    otpRequestController.createOtpRequest
  )
  .get(
    auth.protect,
    validate(otpRequestValidation.getOtpRequests),
    otpRequestController.getOtpRequests
  );

router
  .route("/:otpRequestId")
  .get(
    auth.protect,
    validate(otpRequestValidation.getOtpRequest),
    otpRequestController.getOtpRequest
  )
  .patch(
    auth.protect,
    validate(otpRequestValidation.updateOtpRequest),
    otpRequestController.updateOtpRequest
  )
  .delete(
    auth.protect,
    validate(otpRequestValidation.deleteOtpRequest),
    otpRequestController.deleteOtpRequest
  );

router
  .route("/validate")
  .post(
    auth.protect,
    validate(otpRequestValidation.validateOtp),
    otpRequestController.validateOtp
  );

export default router;