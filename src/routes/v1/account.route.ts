import express, { Router } from "express";
import { accountController } from "../../modules/account";
import { userController } from "../../modules/user";
import { auth } from "../../modules/Auth";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    // auth.checkRoles("CREATE_ACCOUNT"),
    accountController.createAccount
  )
  .get(
    auth.protect,
    // auth.checkRoles("VIEW_ACCOUNTS"),
    accountController.getAccounts
  );

router.route("/account-info").get(auth.protect, accountController.GetAccountInfo);
router.route("/setting/reset-pin").patch(auth.protect, accountController.resetPin);

router
  .route("/:accountId")
  .get(
    auth.protect,
    accountController.getAccount
  )
  .patch(
    auth.protect,
    // auth.checkRoles("UPDATE_ACCOUNT"),
    accountController.updateAccount
  )
  .delete(
    auth.protect,
    // auth.checkRoles("DELETE_ACCOUNT"),
    accountController.deleteAccount
  );

router.get("/:accountId/verify-account", auth.protect, accountController.verifyAccount);
router.patch("/:accountId/update-status", auth.protect, accountController.updateAccountStatus);
router.patch("/admin/:accountId/request-reset-pin", auth.protect, accountController.requestPinReset);
router.patch("/:accountId/basic-details", auth.protect, userController.updateAccountBasicDetails);

export default router;