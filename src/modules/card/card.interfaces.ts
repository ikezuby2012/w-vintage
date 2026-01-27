import { QueryResult } from "modules/paginate/paginate";
import { ObjectId, Types,  Document, Model } from "mongoose";

export interface ICard {
    cardNumber: string;
    userId: ObjectId;
    cardType: string;
    expiryMonth: Date;
    expiryYear: Date;
    cvv: string;
    currency: string;
    dailyLimit: number;
    cardTier: string;
    cardBrand: string;
    cardColor?: string;
    isActive: boolean;
    isVerified: boolean;
    status: "ACTIVE" | "SUSPENDED" | "CLOSED" | "PENDING" | "FROZEN";
    isSoftDeleted?: boolean | undefined;
}

export interface ICardDoc extends ICard, Document {
    _id: string;
}

export interface ICardModel extends Model<ICardDoc> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<QueryResult>;
    isCardNumberTaken(
        cardNumber: string,
        excludeCardId?: Types.ObjectId
    ): Promise<boolean>;
}

export type UpdateCardInfo = Partial<ICard>;
export type TCardBody = Partial<ICard>;

export type NewCreatedCard = Omit<
    ICard,
    | "expiryMonth"
    | "expiryYear"
    | "cardNumber"
    | "userId"
    | "cvv"
    | "isActive"
    | "isSoftDeleted"
    | "isVerified"
    | "createdAt"
    | "updatedAt"
    | "status"
>;