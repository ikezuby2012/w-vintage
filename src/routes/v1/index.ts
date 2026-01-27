import express, { Router } from "express";
import docsRoute from "./swagger.route";
import authRoute from "./auth.route";
import ReferralRoute from "./referrallink.route";
import accountRoute from "./account.route";
import transactionRoute from "./transaction.route";
import transferRoute from "./transfer.route";
import cardRoute from "./card.route";
import beneficiaryRoute from "./beneficiary.route";
import otpRequestRoute from "./otpRequest.route";

// import config from "../../config";

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  // documentation
  {
    path: "/docs",
    route: docsRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/referral",
    route: ReferralRoute,
  },
  {
    path: "/accounts",
    route: accountRoute,
  },
  {
    path: "/transactions",
    route: transactionRoute,
  },
  {
    path: "/transfers",
    route: transferRoute,
  },
  {
    path: "/cards",
    route: cardRoute,
  },
  {
    path: "/beneficiaries",
    route: beneficiaryRoute,
  },
  {
    path: "/otp-request",
    route: otpRequestRoute,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* ignore next */
if ((process.env.NODE_ENV as string) === "development") {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
