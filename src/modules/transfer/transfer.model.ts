import mongoose from "mongoose";
import { ITransferDoc, ITransferModel } from "./transfer.interface";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const transferSchema = new mongoose.Schema<ITransferDoc, ITransferModel>(
  {
    amount: { type: Number, required: true },
    fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    referenceNumber: { type: String, required: true, unique: true },
    fee: { type: Number, default: 0 },
    type: { type: String, required: true },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    bankAddress: { type: String },
    ibanNumber: { type: String },
    paypalEmailAddress: { type: String },
    country: { type: String },
    cashTag: { type: String },
    skrillEmail: { type: String },
    accountType: { type: String },
    routingNumber: { type: String },
    swiftCode: { type: String },
    phoneNumber: { type: String },
    venmoUsername: { type: String },
    emailAddress: { type: String },
    zelleEmail: { type: String },
    aliPayId: { type: String },
    weChatId: { type: String },
    btcWalletAddress: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REJECTED"],
      default: "PENDING"
    },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    description: { type: String },
    otp: { type: String },
    isSoftDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transferSchema.plugin(toJSON);
transferSchema.plugin(paginate as any);

/**
 * Check if reference number is taken
 * @param {string} referenceNumber - The reference number
 * @param {ObjectId} [excludeTransferId] - The id of the transfer to be excluded
 * @returns {Promise<boolean>}
 */
transferSchema.static(
  "isReferenceNumberTaken",
  async function (
    referenceNumber: string,
    excludeTransferId: mongoose.ObjectId
  ): Promise<boolean> {
    const transfer = await this.findOne({ referenceNumber, _id: { $ne: excludeTransferId } });
    return !!transfer;
  }
);

transferSchema.pre<ITransferDoc>(/^find/, function (next) {
  this.populate({
    path: "account",
    populate: {
      path: "userId",
      select: "name email phoneNumber country",
    },
  });
  next();
});

const Transfer = mongoose.model<ITransferDoc, ITransferModel>("Transfer", transferSchema);

export default Transfer;