import Joi from "joi";
import { NewCreatedBeneficiary } from "./beneficiary.interface";

const createBeneficiaryBody: Record<keyof NewCreatedBeneficiary, any> = {
    nickname: Joi.string(),
    bankName: Joi.string(),
    bankCode: Joi.string(),
    accountNumber: Joi.string(),
    accountName: Joi.string(),
    currency: Joi.string(),
    country: Joi.string(),
    isFavorite: Joi.boolean(),
};

const updateBeneficiaryBody: Record<keyof Partial<NewCreatedBeneficiary>, any> = {
    nickname: Joi.string(),
    bankName: Joi.string(),
    bankCode: Joi.string(),
    accountNumber: Joi.string(),
    accountName: Joi.string(),
    currency: Joi.string(),
    country: Joi.string(),
    isFavorite: Joi.boolean(),
};

export const createBeneficiary = {
    body: Joi.object().keys(createBeneficiaryBody),
};

export const updateBeneficiary = {
    params: Joi.object().keys({
        beneficiaryId: Joi.string().required(),
    }),
    body: Joi.object().keys(updateBeneficiaryBody),
};

export const getBeneficiary = {
    params: Joi.object().keys({
        beneficiaryId: Joi.string().required(),
    }),
};

export const deleteBeneficiary = {
    params: Joi.object().keys({
        beneficiaryId: Joi.string().required(),
    }),
};

export const getBeneficiaries = {
    query: Joi.object().keys({
        userId: Joi.string(),
        isFavorite: Joi.boolean(),
        country: Joi.string(),
        currency: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};