import mongoose from "mongoose";
import { ICardDoc, ICardModel } from "./card.interfaces";
import { paginate } from "../paginate";
import { toJSON } from "../toJSON";

const cardSchema = new mongoose.Schema<ICardDoc, ICardModel>(
  {
    cardNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cardType: { type: String, required: true },
    expiryMonth: { type: Date, required: true },
    expiryYear: { type: Date, required: true },
    cvv: { type: String, required: true },
    dailyLimit: { type: Number, default: 1000 },
    cardTier: { type: String, enum: ["Platinum", "Gold", "Silver"], default: "Platinum" },
    cardBrand: { type: String, enum: ["VISA", "MASTERCARD", "AMEX"], default: "VISA" },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "CLOSED", "PENDING", "FROZEN"],
      default: "PENDING"
    },
    cardColor: String,
    isSoftDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cardSchema.plugin(toJSON);
cardSchema.plugin(paginate as any);

/**
 * Check if card number is taken
 * @param {string} cardNumber - The card number
 * @param {ObjectId} [excludeCardId] - The id of the card to be excluded
 * @returns {Promise<boolean>}
 */
cardSchema.static(
  "isCardNumberTaken",
  async function (
    cardNumber: string,
    excludeCardId: mongoose.ObjectId
  ): Promise<boolean> {
    const card = await this.findOne({ cardNumber, _id: { $ne: excludeCardId } });
    return !!card;
  }
);

cardSchema.pre<ICardDoc>(/^find/, function (next) {
  this.populate({
    path: "userId"
  });
  next();
});

const Card = mongoose.model<ICardDoc, ICardModel>("Card", cardSchema);

export default Card;