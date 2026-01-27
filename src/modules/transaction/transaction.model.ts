import mongoose from "mongoose";
import { ITransactionDoc, ITransactionModel } from "./transaction.interfaces";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const transactionSchema = new mongoose.Schema<ITransactionDoc, ITransactionModel>(
    {
        transactionType: {
            type: String,
            enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"],
            required: true
        },
        amount: { type: Number, required: true },
        balanceBefore: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        currency: { type: String, required: true, default: "USD" },
        accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
        referenceNumber: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING"
        },
        description: { type: String },
        isSoftDeleted: { type: Boolean, default: false, select: false },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate as any);

/**
 * Check if reference number is taken
 * @param {string} referenceNumber - The reference number
 * @param {ObjectId} [excludeTransactionId] - The id of the transaction to be excluded
 * @returns {Promise<boolean>}
 */
transactionSchema.static(
  "isReferenceNumberTaken",
  async function (
    referenceNumber: string,
    excludeTransactionId: mongoose.ObjectId
  ): Promise<boolean> {
    const transaction = await this.findOne({ referenceNumber, _id: { $ne: excludeTransactionId } });
    return !!transaction;
  }
);

const Transaction = mongoose.model<ITransactionDoc, ITransactionModel>("Transaction", transactionSchema);

export default Transaction;