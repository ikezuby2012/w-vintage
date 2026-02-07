import express, { Router } from "express";
import { cardController } from "../../modules/card";
import { auth } from "../../modules/Auth";
import validate from "../../modules/validate/validate.middleware";
import * as cardValidation from "../../modules/card/card.validation";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth.protect,
    validate(cardValidation.createCard),
    cardController.createCard
  )
  .get(
    auth.protect,
    validate(cardValidation.getCards),
    cardController.getCards
  );

router.route("/dashboard/card-status-count").get(auth.protect, cardController.getUserCardStatusCounts);
router.route("/user/card").get(auth.protect, cardController.getUserCards);

router
  .route("/:cardId")
  .get(
    auth.protect,
    validate(cardValidation.getCard),
    cardController.getCard
  )
  .patch(
    auth.protect,
    validate(cardValidation.updateCard),
    cardController.updateCard
  )
  .delete(
    auth.protect,
    validate(cardValidation.deleteCard),
    cardController.deleteCard
  );

router.get("/admin/stats", cardController.getCardStats);


export default router;