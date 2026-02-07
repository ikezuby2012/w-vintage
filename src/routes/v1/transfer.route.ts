import express, { Router } from "express";
import { transferController } from "../../modules/transfer";
import { auth } from "../../modules/Auth";
import validate from "../../modules/validate/validate.middleware";
import * as transferValidation from "../../modules/transfer/transfer.validation";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    validate(transferValidation.createTransfer),
    transferController.createTransfer
  )
  .get(
    auth.protect,
    transferController.getTransfers
  );

router
  .route("/:transferId")
  .get(
    auth.protect,
    validate(transferValidation.getTransfer),
    transferController.getTransfer
  )
  .patch(
    auth.protect,
   // validate(transferValidation.updateTransfer),
    transferController.updateTransfer
  )
  .delete(
    auth.protect,
    validate(transferValidation.deleteTransfer),
    transferController.deleteTransfer
  );

router.get("/admin/stats", transferController.getTransferStats);
// router
//   .route("/validate-otp")
//   .post(
//     auth.protect,
//     validate(transferValidation.validateTransferOtp),
//     transferController.validateTransferOtp
//   );

export default router;