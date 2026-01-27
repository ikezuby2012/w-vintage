import Joi from "joi";
import { NewCreatedTransfer } from "./transfer.interface";

const createTransferBody: Record<keyof NewCreatedTransfer, any> = {
  amount: Joi.number().required().min(0),
  fee: Joi.number().optional().min(0),
  type: Joi.string().required(),
  transactionPin: Joi.string().required(),
  accountHolderName: Joi.string(),
  accountNumber: Joi.string(),
  bankName: Joi.string(),
  bankAddress: Joi.string(),
  ibanNumber: Joi.string(),
  paypalEmailAddress: Joi.string(),
  country: Joi.string(),
  cashTag: Joi.string(),
  skrillEmail: Joi.string(),
  accountType: Joi.string(),
  routingNumber: Joi.string(),
  swiftCode: Joi.string(),
  phoneNumber: Joi.string(),
  venmoUsername: Joi.string(),
  emailAddress: Joi.string(),
  zelleEmail: Joi.string(),
  aliPayId: Joi.string(),
  weChatId: Joi.string(),
  // status: Joi.string().valid("PENDING", "COMPLETED", "FAILED"),
  description: Joi.string(),
  otp: Joi.string(),
  saveAsBeneficiary: Joi.boolean().optional()
};

const updateTransferBody: Record<keyof Partial<NewCreatedTransfer>, any> = {
  amount: Joi.number().min(0),
  fee: Joi.number().min(0),
  type: Joi.string(),
  accountHolderName: Joi.string(),
  accountNumber: Joi.string(),
  bankName: Joi.string(),
  bankAddress: Joi.string(),
  ibanNumber: Joi.string(),
  paypalEmailAddress: Joi.string(),
  country: Joi.string(),
  cashTag: Joi.string(),
  skrillEmail: Joi.string(),
  accountType: Joi.string(),
  routingNumber: Joi.string(),
  swiftCode: Joi.string(),
  phoneNumber: Joi.string(),
  venmoUsername: Joi.string(),
  emailAddress: Joi.string(),
  zelleEmail: Joi.string(),
  aliPayId: Joi.string(),
  weChatId: Joi.string(),
  // status: Joi.string().valid("PENDING", "COMPLETED", "FAILED"),
  description: Joi.string(),
  otp: Joi.string(),
  transactionPin: Joi.string(),
  saveAsBeneficiary: Joi.boolean().optional()
};

export const createTransfer = {
  body: Joi.object().keys(createTransferBody),
};

export const updateTransfer = {
  params: Joi.object().keys({
    transferId: Joi.string().required(),
  }),
  body: Joi.object().keys(updateTransferBody),
};

export const getTransfer = {
  params: Joi.object().keys({
    transferId: Joi.string().required(),
  }),
};

export const deleteTransfer = {
  params: Joi.object().keys({
    transferId: Joi.string().required(),
  }),
};

export const validateTransferOtp = {
  body: Joi.object().keys({
    transferId: Joi.string().required(),
  }),
};