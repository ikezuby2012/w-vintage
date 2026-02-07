import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as cardService from "./card.service";
import Card from "./card.model";
import { Transaction } from "../transaction";


export const createCard = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const {
    cardType,
    currency,
    dailyLimit,
    cardTier,
    cardBrand,
    cardColor,
  } = req.body;

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);

  let cardNumber;
  let isUnique = false;

  console.log('Starting account number generation');

  // 2. Generate unique account number (without transaction session)
  for (let attempts = 0; attempts < 10; attempts++) { // Increased attempts
    cardNumber = cardService.generateCardNumber(cardBrand);
    console.log(`Generated account number attempt ${attempts + 1}: ${cardNumber}`);

    const existing = await Card.findOne({ cardNumber }).lean();
    if (!existing) {
      isUnique = true;
      break;
    }
  }

  if (!isUnique) {
    return next(new ApiError(httpStatus.CONFLICT, "Unable to create card"))
  }

  const card = await Card.create({
    cardNumber: cardService.generateCardNumber(cardBrand),
    userId: new Types.ObjectId(userId),
    cardType,
    expiryMonth: expiryDate,
    expiryYear: expiryDate,
    cvv: cardService.generateCVV(),
    currency,
    dailyLimit,
    cardTier,
    cardBrand,
    cardColor,
    isActive: true,
    isVerified: false,
    status: "PENDING",
    isSoftDeleted: false,
  });

  if (!card) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Unable to create card"))
  }

  return res.status(httpStatus.CREATED).json({
    status: "success",
    message: "Card Created Successfully",
    data: card
  })

});

export const getCards = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["userId", "cardType", "status"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await cardService.queryCards(filter, options);

  res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getCard = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.cardId === "string") {
    const card = await cardService.getCardById(
      new mongoose.Types.ObjectId(req.params.cardId)
    );
    if (!card) {
      throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
    }

    res.status(httpStatus.OK).json({
      status: "success",
      data: card,
    });
  }
});

export const updateCard = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.cardId === "string") {
    const card = await cardService.updateCardById(
      new mongoose.Types.ObjectId(req.params.cardId),
      req.body
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: card,
    });
  }
});

export const deleteCard = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params.cardId === "string") {
    await cardService.deleteCardById(
      new mongoose.Types.ObjectId(req.params.cardId)
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const getUserCardStatusCounts = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const counts = await Card.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        isSoftDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    pending: 0,
    active: 0,
  };

  for (const item of counts) {
    if (item._id === "PENDING") result.pending = item.count;
    if (item._id === "ACTIVE") result.active = item.count;
  }

  return res.status(httpStatus.OK).json({
    status: "success",
    data: result,
  });
});

export const getUserCards = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const cards = await Card.find({ userId }).populate("userId");

  return res.status(httpStatus.OK).json({
    status: "success",
    data: cards,
  });
});

export const getCardStats = catchAsync(
  async (req: Request, res: Response) => {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
    endOfMonth.setUTCDate(1);
    endOfMonth.setUTCHours(0, 0, 0, 0);

    const [cardStats, monthlySpend] = await Promise.all([
      Card.aggregate([
        {
          $match: { isSoftDeleted: { $ne: true } }
        },
        {
          $group: {
            _id: null,
            totalCards: { $sum: 1 },
            activeCards: {
              $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] }
            },
            frozenCards: {
              $sum: { $cond: [{ $eq: ["$status", "FROZEN"] }, 1, 0] }
            }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            // transactionType: "PAYMENT",
            status: "COMPLETED",
            createdAt: {
              $gte: startOfMonth,
              $lt: endOfMonth
            },
            isSoftDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: null,
            monthlySpend: { $sum: "$amount" }
          }
        }
      ])
    ]);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        totalCards: cardStats[0]?.totalCards ?? 0,
        activeCards: cardStats[0]?.activeCards ?? 0,
        frozenCards: cardStats[0]?.frozenCards ?? 0,
        monthlySpend: monthlySpend[0]?.monthlySpend ?? 0
      }
    });
  }
);
