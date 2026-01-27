import Joi from "joi";
import { NewCreatedOtpRequest } from "./otpRequest.interface";

const createOtpRequestBody: Record<keyof NewCreatedOtpRequest, any> = {
  transactionId: Joi.string().required(),
  purpose: Joi.string().valid("TRANSFER", "WITHDRAWAL", "CARD_PAYMENT").required(),

};

const updateOtpRequestBody: Record<keyof Partial<NewCreatedOtpRequest>, any> = {
  transactionId: Joi.string(),
  purpose: Joi.string().valid("TRANSFER", "WITHDRAWAL", "CARD_PAYMENT"),
};

const validateOtpBody = {
  transactionId: Joi.string().required(),
  otp: Joi.string().required(),
};

export const createOtpRequest = {
  body: Joi.object().keys(createOtpRequestBody),
};

export const updateOtpRequest = {
  params: Joi.object().keys({
    otpRequestId: Joi.string().required(),
  }),
  body: Joi.object().keys(updateOtpRequestBody),
};

export const getOtpRequest = {
  params: Joi.object().keys({
    otpRequestId: Joi.string().required(),
  }),
};

export const deleteOtpRequest = {
  params: Joi.object().keys({
    otpRequestId: Joi.string().required(),
  }),
};

export const getOtpRequests = {
  query: Joi.object().keys({
    userId: Joi.string(),
    purpose: Joi.string().valid("TRANSFER", "WITHDRAWAL", "CARD_PAYMENT"),
    isUsed: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const validateOtp = {
  body: Joi.object().keys(validateOtpBody),
};