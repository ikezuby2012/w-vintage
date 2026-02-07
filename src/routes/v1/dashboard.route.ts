import express, { Router } from "express";
import { dashboardController } from "../../modules/dashboard";
import { auth } from "../../modules/Auth";

const router: Router = express.Router();

router.route("/admin/stats-count").get(auth.protect, dashboardController.AdminStatsCard);
router.get("/transactions/chart", auth.protect, dashboardController.ChartTrasactionStats);
router.get("/accounts/status/:status", auth.protect, dashboardController.GetAccountsWithStatus);
router.get("/accounts/status/:status/count", auth.protect, dashboardController.GetUserStatusCount);
router.get("/user/status-stats", auth.protect, dashboardController.GetUserStatsSummary);

export default router;