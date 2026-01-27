import express, { Router } from "express";
import { accountController } from "../../modules/account";
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

export default router;