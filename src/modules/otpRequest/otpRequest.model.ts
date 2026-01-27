import mongoose from "mongoose";
import { IOtpRequestDoc, IOtpRequestModel } from "./otpRequest.interface";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const otpRequestSchema = new mongoose.Schema<IOtpRequestDoc, IOtpRequestModel>(
  {
    transactionId: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true, enum: ["TRANSFER", "WITHDRAWAL", "CARD_PAYMENT"] },
    verifiedAt: { type: Date },
    otpExpiredAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
otpRequestSchema.plugin(toJSON);
otpRequestSchema.plugin(paginate as any);

/**
 * Check if OTP is used
 * @param {string} otp - The OTP
 * @param {ObjectId} transactionId - The transaction ID
 * @returns {Promise<boolean>}
 */
otpRequestSchema.static(
  "isOtpUsed",
  async function (
    otp: string,
    transactionId: mongoose.ObjectId
  ): Promise<boolean> {
    const otpRequest = await this.findOne({
      otp,
      transactionId,
      isUsed: true
    });
    return !!otpRequest;
  }
);

const OtpRequest = mongoose.model<IOtpRequestDoc, IOtpRequestModel>("OtpRequest", otpRequestSchema);

export default OtpRequest;