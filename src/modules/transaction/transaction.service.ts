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
import { Account } from "../account";

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

export const GetTransactionsCount = () => Transaction.countDocuments();

export const getTransactionStats = async () => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalVolume: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        successfulTransactions: {
          $sum: {
            $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
          },
        },
        failedTransactions: {
          $sum: {
            $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVolume: 1,
        totalTransactions: 1,
        successfulTransactions: 1,
        failedTransactions: 1,
      },
    },
  ]);

  return (
    result[0] || {
      totalVolume: 0,
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
    }
  );
};

export const updateTransactionStatusService = async (
  transactionId: string,
  status: "COMPLETED" | "FAILED"
) => {
  // 1. Load transaction
  const transaction = await Transaction.findOne({
    _id: transactionId,
    isSoftDeleted: { $ne: true },
  });

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  if (transaction.status === "COMPLETED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Transaction already completed");
  }

  // 2. If FAILED → just update status
  if (status === "FAILED") {
    transaction.status = "FAILED";
    await transaction.save();
    return transaction;
  }

  // 3. COMPLETED logic
  const account = await Account.findById(transaction.accountId);

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  const balanceBefore = account.balance;
  let balanceChange = 0;

  if (transaction.transactionType === "DEPOSIT") {
    balanceChange = transaction.amount;
  } else {
    if (balanceBefore < transaction.amount) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }
    balanceChange = -transaction.amount;
  }

  // 4. Atomically update account balance
  const updatedAccount = await Account.findOneAndUpdate(
    {
      _id: account._id,
      balance: balanceChange < 0 ? { $gte: transaction.amount } : { $gte: 0 },
    },
    {
      $inc: { balance: balanceChange },
    },
    { new: true }
  );

  if (!updatedAccount) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Balance update failed"
    );
  }

  // 5. Update transaction ledger
  transaction.status = "COMPLETED";
  transaction.balanceBefore = balanceBefore;
  transaction.balanceAfter = updatedAccount.balance;

  await transaction.save();

  return transaction;
};
