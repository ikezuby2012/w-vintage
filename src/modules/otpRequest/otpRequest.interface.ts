import { QueryResult } from "modules/paginate/paginate";
import { ObjectId, Types, Document, Model } from "mongoose";

export interface IOtpRequest {
  transactionId: string;
  otp: string;
  purpose: "TRANSFER" | "WITHDRAWAL" | "CARD_PAYMENT" | string;
  verifiedAt?: Date;
  otpExpiredAt: Date;
  isUsed?: boolean;
  userId: Types.ObjectId;
}

export interface IOtpRequestDoc extends IOtpRequest, Document {
  _id: string;
}

export interface IOtpRequestModel extends Model<IOtpRequestDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
  isOtpUsed(
    otp: string,
    transactionId: Types.ObjectId
  ): Promise<boolean>;
}

export type UpdateOtpRequestInfo = Partial<IOtpRequest>;
export type TOtpRequestBody = Partial<IOtpRequest>;

export type NewCreatedOtpRequest = Omit<
  IOtpRequest,
  | "otpExpiredAt"
  | "userId"
  | "isUsed"
  | "otp"
  | "verifiedAt"
  | "createdAt"
  | "updatedAt"
>;
