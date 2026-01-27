import mongoose from "mongoose";
import { IBeneficiaryDoc, IBeneficiaryModel } from "./beneficiary.interface";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const beneficiarySchema = new mongoose.Schema<IBeneficiaryDoc, IBeneficiaryModel>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        nickname: { type: String },
        bankName: { type: String },
        bankCode: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
        currency: { type: String },
        country: { type: String, },
        isFavorite: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: true },
        lastTransferredAt: { type: Date },
        isSoftDeleted: { type: Boolean, default: false, select: false },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
beneficiarySchema.plugin(toJSON);
beneficiarySchema.plugin(paginate as any);

/**
 * Check if beneficiary is taken
 * @param {string} accountNumber - The account number
 * @param {string} bankCode - The bank code
 * @param {ObjectId} [excludeBeneficiaryId] - The id of the beneficiary to be excluded
 * @returns {Promise<boolean>}
 */
beneficiarySchema.static(
    "isBeneficiaryTaken",
    async function (
        accountNumber: string,
        bankCode: string,
        excludeBeneficiaryId?: mongoose.ObjectId
    ): Promise<boolean> {
        const beneficiary = await this.findOne({
            accountNumber,
            bankCode,
            _id: { $ne: excludeBeneficiaryId }
        });
        return !!beneficiary;
    }
);

const Beneficiary = mongoose.model<IBeneficiaryDoc, IBeneficiaryModel>("Beneficiary", beneficiarySchema);

export default Beneficiary;