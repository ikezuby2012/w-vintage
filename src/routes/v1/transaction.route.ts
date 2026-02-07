import express, { Router } from "express";
import { transactionController } from "../../modules/transaction";
import { auth } from "../../modules/Auth";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    //auth.checkRoles("CREATE_TRANSACTION"),
    transactionController.createTransaction
  )
  .get(
    auth.protect,
    //auth.checkRoles("VIEW_TRANSACTIONS"),
    transactionController.getTransactions
  );

router.route("/user/txn").get(auth.protect, transactionController.getUserTransaction);

router
  .route("/:transactionId")
  .get(
    auth.protect,
    //auth.checkRoles("VIEW_TRANSACTION"),
    transactionController.getTransaction
  )
  .patch(
    auth.protect,
    //auth.checkRoles("UPDATE_TRANSACTION"),
    transactionController.updateTransaction
  )
  .delete(
    auth.protect,
    //auth.checkRoles("DELETE_TRANSACTION"),
    transactionController.deleteTransaction
  );

router.route("/deposit").post(auth.protect, transactionController.depositTransaction);
router.patch("/:transactionId/status", auth.protect, transactionController.updateTransactionStatus);
router.get("/admin/stats", transactionController.getTransactionStats);

export default router;