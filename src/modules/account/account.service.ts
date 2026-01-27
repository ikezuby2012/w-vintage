import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Account from "./account.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  IAccountDoc,
  UpdateAccountInfo,
  NewCreatedAccount,
} from "./account.interface";

/**
 * Create an account
 * @param {NewCreatedAccount} accountBody
 * @returns {Promise<IAccountDoc>}
 */
export const createAccount = async (
  accountBody: NewCreatedAccount
): Promise<IAccountDoc> => {
  if (await Account.isAccountNumberTaken(accountBody.accountNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account number already taken");
  }
  return Account.create(accountBody);
};

/**
 * Query for accounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryAccounts = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const accounts = await Account.paginate(filter, options);
  return accounts;
};

/**
 * Get account by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IAccountDoc | null>}
 */
export const getAccountById = async (
  id: mongoose.Types.ObjectId
): Promise<IAccountDoc | null> => Account.findById(id);

/**
 * Get account by account number
 * @param {string} accountNumber
 * @returns {Promise<IAccountDoc | null>}
 */
export const getAccountByAccountNumber = async (
  accountNumber: string
): Promise<IAccountDoc | null> => Account.findOne({ accountNumber });

/**
 * Update account by id
 * @param {mongoose.Types.ObjectId} accountId
 * @param {UpdateAccountInfo} updateBody
 * @returns {Promise<IAccountDoc | null>}
 */
export const updateAccountById = async (
  accountId: Types.ObjectId,
  updateBody: UpdateAccountInfo
): Promise<IAccountDoc | null> => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  if (
    updateBody.accountNumber &&
    (await Account.isAccountNumberTaken(updateBody.accountNumber, accountId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account number already taken");
  }
  Object.assign(account, updateBody);
  await account.save();
  return account;
};

/**
 * Delete account by id
 * @param {mongoose.Types.ObjectId} accountId
 * @returns {Promise<IAccountDoc | null>}
 */
export const deleteAccountById = async (
  accountId: mongoose.Types.ObjectId
): Promise<IAccountDoc | null> => {
  const account = await Account.findByIdAndDelete(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  return account;
};

/**
 * Get account by userId
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IAccountDoc | null>}
 */
export const getAccountByUserId = async (
  userId: mongoose.Types.ObjectId
): Promise<any | null> => Account.findOne({ userId }).select("+transactionPin");