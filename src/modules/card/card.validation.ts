import Joi from "joi";
import { NewCreatedCard } from "./card.interfaces";

const createCardBody: Record<keyof NewCreatedCard, any> = {
  cardType: Joi.string().required(),
  currency: Joi.string().required(),
  dailyLimit: Joi.number().min(0).required(),
  cardTier: Joi.string().valid("Platinum", "Gold", "Silver").required(),
  cardBrand: Joi.string().valid("VISA", "Mastercard", "AMEX").required(),
  cardColor: Joi.string(),
};

const updateCardBody: Record<keyof Partial<NewCreatedCard>, any> = {
  cardType: Joi.string(),
  currency: Joi.string(),
  dailyLimit: Joi.number().min(100),
  cardTier: Joi.string().valid("Platinum", "Gold", "Silver"),
  cardBrand: Joi.string().valid("VISA", "MASTERCARD", "AMEX"),
  cardColor: Joi.string(),
};

export const createCard = {
  body: Joi.object().keys(createCardBody),
};

export const updateCard = {
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
  body: Joi.object().keys(updateCardBody),
};

export const getCard = {
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
};

export const deleteCard = {
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
};

export const getCards = {
  query: Joi.object().keys({
    userId: Joi.string(),
    cardType: Joi.string(),
    status: Joi.string().valid("ACTIVE", "SUSPENDED", "CLOSED", "PENDING", "FROZEN"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};