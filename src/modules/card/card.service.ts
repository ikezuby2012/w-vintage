import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Card from "./card.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
    ICardDoc,
    UpdateCardInfo,
    NewCreatedCard,
} from "./card.interfaces";

type CardBrand = "VISA" | "MASTERCARD" | "AMEX";

const CARD_CONFIG: Record<CardBrand, { prefix: string; length: number }> = {
  VISA: { prefix: "4", length: 16 },
  MASTERCARD: { prefix: "5", length: 16 },
  AMEX: { prefix: "3", length: 15 },
};

/**
 * Create a card
 * @param {NewCreatedCard} cardBody
 * @returns {Promise<ICardDoc>}
 */
export const createCard = async (
    cardBody: NewCreatedCard
): Promise<ICardDoc> => {
    return Card.create(cardBody);
};

/**
 * Query for cards
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryCards = async (
    filter: Record<string, any>,
    options: IOptions
): Promise<QueryResult> => {
    const cards = await Card.paginate(filter, options);
    return cards;
};

/**
 * Get card by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ICardDoc | null>}
 */
export const getCardById = async (
    id: mongoose.Types.ObjectId
): Promise<ICardDoc | null> => Card.findById(id);

/**
 * Get card by card number
 * @param {string} cardNumber
 * @returns {Promise<ICardDoc | null>}
 */
export const getCardByCardNumber = async (
    cardNumber: string
): Promise<ICardDoc | null> => Card.findOne({ cardNumber });

/**
 * Update card by id
 * @param {mongoose.Types.ObjectId} cardId
 * @param {UpdateCardInfo} updateBody
 * @returns {Promise<ICardDoc | null>}
 */
export const updateCardById = async (
    cardId: Types.ObjectId,
    updateBody: UpdateCardInfo
): Promise<ICardDoc | null> => {
    const card = await getCardById(cardId);
    if (!card) {
        throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
    }
    if (
        updateBody.cardNumber &&
        (await Card.isCardNumberTaken(updateBody.cardNumber, cardId))
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Card number already taken");
    }
    Object.assign(card, updateBody);
    await card.save();
    return card;
};

/**
 * Delete card by id
 * @param {mongoose.Types.ObjectId} cardId
 * @returns {Promise<ICardDoc | null>}
 */
export const deleteCardById = async (
    cardId: mongoose.Types.ObjectId
): Promise<ICardDoc | null> => {
    const card = await Card.findByIdAndDelete(cardId);
    if (!card) {
        throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
    }
    return card;
};

function calculateLuhnCheckDigit(number: string): string {
  let sum = 0;
  let shouldDouble = true;

  // Traverse from right to left
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return ((10 - (sum % 10)) % 10).toString();
}


/**
 * Generate card Number
 * @param {String} cardBrand
 * @returns {Promise<String | null>}
 */
export function generateCardNumber(brand: CardBrand): string {
  const config = CARD_CONFIG[brand] ?? CARD_CONFIG.VISA;

  let number = config.prefix;

  const digitsToGenerate = config.length - number.length - 1;

  for (let i = 0; i < digitsToGenerate; i++) {
    number += Math.floor(Math.random() * 10);
  }

  const checkDigit = calculateLuhnCheckDigit(number);

  return number + checkDigit;
}

export const generateCVV = (): string => {
  return Math.floor(100 + Math.random() * 900).toString();
};