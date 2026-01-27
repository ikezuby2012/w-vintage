import express, { Router } from "express";
import { referralLinkController } from "../../modules/ReferralLink";
// import { validate } from "../../modules/validate";
import { auth } from "../../modules/Auth";

const router: Router = express.Router();

router
  .route("/")
  .post(
    // validate(courseValidation.createNewcourse),
    auth.protect,
    auth.checkRoles("CREATE_LINK"),
    referralLinkController.createNewReferralLink
  )
  .get(referralLinkController.getAllReferralsLink);

export default router;
