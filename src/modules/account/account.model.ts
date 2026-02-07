import mongoose from "mongoose";
import { IAccountDoc, IAccountModel } from "./account.interface";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const accountSchema = new mongoose.Schema<IAccountDoc, IAccountModel>(
  {
    accountNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountType: { type: String, required: true, unique: false },
    balance: { type: Number, default: 0 },
    btcBalance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    isActive: { type: Boolean, default: false },
    transactionPin: {
      type: String,
      select: false, // NEVER return it by default
    },

    isVerified: { type: Boolean, default: false },
    status:
    {
      type:
        String,
      enum:
        ["ACTIVE", "SUSPENDED", "CLOSED", "PENDING", "FROZEN"],
      default:
        "PENDING"
    },
    isSoftDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accountSchema.plugin(toJSON);
accountSchema.plugin(paginate as any);

/**
 * Check if account number is taken
 * @param {string} accountNumber - The account number
 * @param {ObjectId} [excludeAccountId] - The id of the account to be excluded
 * @returns {Promise<boolean>}
 */
accountSchema.static(
  "isAccountNumberTaken",
  async function (
    accountNumber: string,
    excludeAccountId: mongoose.Types.ObjectId
  ): Promise<boolean> {
    const account = await this.findOne({ accountNumber, _id: { $ne: excludeAccountId } });
    return !!account;
  }
);

accountSchema.pre<IAccountDoc>(/^find/, function (next) {
  this.populate({
    path: "userId"
  });
  next();
});

const Account = mongoose.model<IAccountDoc, IAccountModel>("Account", accountSchema);

export default Account;