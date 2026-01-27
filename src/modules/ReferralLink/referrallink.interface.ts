import { Model, Document, Types } from "mongoose";
import { QueryResult } from "../paginate/paginate";

export interface IReferralLink {
  AffliateId: string | Types.ObjectId;
  CourseId: string | Types.ObjectId;
  Link: string;
  expired?: boolean;
  expired_at?: Date;
  isSoftDeleted: boolean;
}

type MakeRequiredExcept<T, K extends keyof T> = {
  [P in keyof T as P extends K ? P : Required<P>]: T[P];
};

export type NewReferralLinkExcept = MakeRequiredExcept<
  IReferralLink,
  "expired" | "expired_at" | "isSoftDeleted"
>;

export type UpdateReferralLink = Partial<IReferralLink>;

export type NewReferralLink = Omit<NewReferralLinkExcept, "expired" | "isSoftDeleted" | "Link">;

export interface IReferralLinkDoc extends IReferralLink, Document {
  _id: string;
}

export interface IReferralLinkModel extends Model<IReferralLinkDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}
