import { ObjectId, Document, Model, Types } from "mongoose";
import { QueryResult } from "modules/paginate/paginate";

export interface ITransaction {
    transactionType: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    currency: string;
    accountId: ObjectId;
    referenceNumber: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    description?: string;
    isSoftDeleted?: boolean | undefined;
}

export interface ITransactionDoc extends ITransaction, Document {
    _id: string;
}

export interface ITransactionModel extends Model<ITransactionDoc> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<QueryResult>;
    isReferenceNumberTaken(
        referenceNumber: string,
        excludeTransactionId?: Types.ObjectId
    ): Promise<boolean>;
}

export type UpdateTransactionInfo = Partial<ITransaction>;
export type TTransactionBody = Partial<ITransaction>;

export type NewCreatedTransaction = Omit<
    ITransaction,
    | "isSoftDeleted"
    | "createdAt"
    | "updatedAt"
>;