import { IAccount } from "modules/account/account.interface";
import { QueryResult } from "modules/paginate/paginate";
import { ObjectId, Types, Document, Model } from "mongoose";

export interface ITransfer {
    amount: number;
    fromAccountId?: ObjectId;
    toAccountId?: ObjectId;
    referenceNumber: string;
    fee: number;
    type: string;
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    bankAddress?: string;
    ibanNumber?: string;
    paypalEmailAddress?: string;
    country?: string;
    cashTag?: string;
    skrillEmail?: string;
    accountType?: string;
    routingNumber?: string;
    swiftCode?: string;
    phoneNumber?: string;
    venmoUsername?: string;
    emailAddress?: string;
    zelleEmail?: string;
    aliPayId?: string;
    weChatId?: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    description?: string;
    otp?: string;
    btcWalletAddress?: string;
    isSoftDeleted?: boolean | undefined;
}

export interface ITransferDoc extends ITransfer, Document {
    _id: string;
}

export interface ITransferModel extends Model<ITransferDoc> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<QueryResult>;
    isReferenceNumberTaken(
        referenceNumber: string,
        excludeTransferId?: Types.ObjectId
    ): Promise<boolean>;
}

export type UpdateTransferInfo = Partial<ITransfer>;
export type TTransferBody = Partial<ITransfer>;

export type NewCreatedTransfer = Omit<
    ITransfer,
    | "status"
    | "fromAccountId"
    | "toAccountId"
    | "isSoftDeleted"
    | "createdAt"
    | "updatedAt"
    | "otpExpiredAt"
    | "referenceNumber"
> & Pick<IAccount, 'transactionPin'> & {
    saveAsBeneficiary?: boolean; // Optional
};
