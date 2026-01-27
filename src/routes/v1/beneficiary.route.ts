import express, { Router } from "express";
import { beneficiaryController } from "../../modules/beneficiary";
import { auth } from "../../modules/Auth";
import validate from "../../modules/validate/validate.middleware";
import * as beneficiaryValidation from "../../modules/beneficiary/beneficiary.validation";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    validate(beneficiaryValidation.createBeneficiary),
    beneficiaryController.createBeneficiary
  )
  .get(
    auth.protect,
    validate(beneficiaryValidation.getBeneficiaries),
    beneficiaryController.getBeneficiaries
  );

router.route("/user/beneficiaries").get(auth.protect, beneficiaryController.getUserBeneficiaries);

router
  .route("/:beneficiaryId")
  .get(
    auth.protect,
    validate(beneficiaryValidation.getBeneficiary),
    beneficiaryController.getBeneficiary
  )
  .patch(
    auth.protect,
    validate(beneficiaryValidation.updateBeneficiary),
    beneficiaryController.updateBeneficiary
  )
  .delete(
    auth.protect,
    validate(beneficiaryValidation.deleteBeneficiary),
    beneficiaryController.deleteBeneficiary
  );

export default router;