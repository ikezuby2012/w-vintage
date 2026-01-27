import { QueryResult } from "modules/paginate/paginate";
import { ObjectId, Types, Document, Model } from "mongoose";

export interface IBeneficiary {
  userId: Types.ObjectId;          // Owner of the beneficiary
  nickname: string;                // "My Savings", "Mum", "Rent Account"

  bankName: string;
  bankCode?: string;               // e.g. NUBAN / SWIFT / sort code
  accountNumber: string;
  accountName: string;

  currency: string;
  country: string;

  isFavorite: boolean;
  isVerified: boolean;

  lastTransferredAt?: Date;

  isSoftDeleted?: boolean;
}

export interface IBeneficiaryDoc extends IBeneficiary, Document {
  _id: string;
}

export interface IBeneficiaryModel extends Model<IBeneficiaryDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
  isBeneficiaryTaken(
    accountNumber: string,
    bankCode: string,
    excludeBeneficiaryId?: Types.ObjectId
  ): Promise<boolean>;
}

export type UpdateBeneficiaryInfo = Partial<IBeneficiary>;
export type TBeneficiaryBody = Partial<IBeneficiary>;

export type NewCreatedBeneficiary = Omit<
  IBeneficiary,
  | "userId"
  | "isVerified"
  | "isSoftDeleted"
  | "lastTransferredAt"
  | "createdAt"
  | "updatedAt"
>;
