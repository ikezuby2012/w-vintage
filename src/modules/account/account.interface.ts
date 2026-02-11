import { QueryResult } from "modules/paginate/paginate";
import { ObjectId, Document, Model, Types } from "mongoose";

export interface IAccount {
    accountNumber: string;
    userId: ObjectId;
    accountType: string;
    balance: number;
    btcBalance?: number | undefined;
    currency?: string | undefined;
    transactionPin?: string;
    isActive: boolean;
    isVerified: boolean;
    resetPinToken?: string;
    resetPinExpires?: Date;
    mustResetPin?: boolean;
    status: "ACTIVE" | "SUSPENDED" | "CLOSED" | "PENDING" | "FROZEN";
    isSoftDeleted?: boolean | undefined;
}

export interface IAccountDoc extends IAccount, Document {
    _id: string;
}


export interface IAccountModel extends Model<IAccountDoc> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<QueryResult>;
    isAccountNumberTaken(
        accountNumber: string,
        excludeAccountId?: Types.ObjectId
    ): Promise<boolean>;
}

export type UpdateAccountInfo = Partial<IAccount>;
export type TAccountBody = Partial<IAccount>;

export type NewCreatedAccount = Omit<
    IAccount,
    | "isActive"
    | "isSoftDeleted"
    | "isVerified"
    | "createdAt"
    | "updatedAt"
    | "resetPinToken"
    | "resetPinExpires"
    | "mustResetPin"
>;