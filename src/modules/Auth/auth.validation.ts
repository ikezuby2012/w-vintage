import { password } from "../validate/custom.validation";
import { NewRegisteredUser } from "../user/user.interfaces";

const Joi = require("joi");

const registerBody: Record<keyof NewRegisteredUser, any> = {
  email: Joi.string().required().email(),
  password: Joi.string().required().custom(password),
  passwordConfirm: Joi.string().required().custom(password),
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  country: Joi.string().optional(),
  accountType: Joi.string().required(),
  transactionPin: Joi.string().required(),
};

export const register = {
  body: Joi.object().keys(registerBody),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  // params: Joi.object().keys({
  //   otp: Joi.string().required(),
  // }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    passwordConfirm: Joi.string().required().custom(password),
    otp: Joi.string().required(),
  }),
};

export const verifyEmail = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    otp: Joi.string().required(),
  }),
};