import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Transaction from "./transaction.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  ITransactionDoc,
  UpdateTransactionInfo,
  NewCreatedTransaction,
} from "./transaction.interfaces";

/**
 * Create a transaction
 * @param {NewCreatedTransaction} transactionBody
 * @returns {Promise<ITransactionDoc>}
 */
export const createTransaction = async (
  transactionBody: NewCreatedTransaction
): Promise<ITransactionDoc> => {
  if (await Transaction.isReferenceNumberTaken(transactionBody.referenceNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reference number already taken");
  }
  return Transaction.create(transactionBody);
};

/**
 * Query for transactions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryTransactions = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const transactions = await Transaction.paginate(filter, options);
  console.log(transactions.results[0]);
  return transactions;
};

/**
 * Get transaction by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITransactionDoc | null>}
 */
export const getTransactionById = async (
  id: mongoose.Types.ObjectId
): Promise<ITransactionDoc | null> => Transaction.findById(id);

/**
 * Get transaction by reference number
 * @param {string} referenceNumber
 * @returns {Promise<ITransactionDoc | null>}
 */
export const getTransactionByReferenceNumber = async (
  referenceNumber: string
): Promise<ITransactionDoc | null> => Transaction.findOne({ referenceNumber });

/**
 * Update transaction by id
 * @param {mongoose.Types.ObjectId} transactionId
 * @param {UpdateTransactionInfo} updateBody
 * @returns {Promise<ITransactionDoc | null>}
 */
export const updateTransactionById = async (
  transactionId: Types.ObjectId,
  updateBody: UpdateTransactionInfo
): Promise<ITransactionDoc | null> => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }
  if (
    updateBody.referenceNumber &&
    (await Transaction.isReferenceNumberTaken(updateBody.referenceNumber, transactionId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reference number already taken");
  }
  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};

/**
 * Delete transaction by id
 * @param {mongoose.Types.ObjectId} transactionId
 * @returns {Promise<ITransactionDoc | null>}
 */
export const deleteTransactionById = async (
  transactionId: mongoose.Types.ObjectId
): Promise<ITransactionDoc | null> => {
  const transaction = await Transaction.findByIdAndDelete(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }
  return transaction;
};

export const generateTransactionNumber = async () => {
  const now = new Date();

  // Extract Year (YYYY)
  const year = now.getFullYear();

  // padStart ensures it is always two digits
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Get Timestamp in milliseconds
  const timestamp = now.getTime();

  return `TRF${year}${month}${timestamp}`;
}