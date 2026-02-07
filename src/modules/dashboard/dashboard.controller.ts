import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import * as userService from "../user/user.service";
import * as transactionService from "../transaction/transaction.service";
import * as cardService from "../card/card.service";
import * as accountService from "../account/account.service";
import Account from "../account/account.model";
import { Transaction } from "../transaction";

export const AdminStatsCard = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
    const [totalUsers, totalTransactions, totalCards, totalAccountBalance] = await Promise.all([
        userService.GetUsersCount(),
        transactionService.GetTransactionsCount(),
        cardService.GetCardsCount(),
        Account.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" }
                }
            }
        ])
    ]);

    res.status(httpStatus.OK).json({
        status: "success",
        data: {
            totalUsers,
            totalTransactions,
            totalCards,
            totalAccountBalance: totalAccountBalance[0]?.totalBalance || 0
        }
    })
});

export const ChartTrasactionStats = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const data = await Transaction.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                totalAmount: { $sum: "$amount" },
                totalTransactions: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill missing days with zero values
    const result: any = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        const dayData = data.find(d => d._id === dateStr);

        result.push({
            date: dateStr,
            totalAmount: dayData?.totalAmount || 0,
            totalTransactions: dayData?.totalTransactions || 0
        });
    }

    res.status(httpStatus.OK).json({
        status: "success",
        data: result
    })
});

export const GetAccountsWithStatus = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const accounts = await accountService.GetAccountByStatus(status);

    if (!accounts) return next(new ApiError(httpStatus.NOT_FOUND, `no accounts was found with status of ${status}`));

    res.status(httpStatus.OK).json({
        status: "success",
        data: accounts
    });
});

export const GetUserStatsSummary = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
    const [totalUsers, activeAccounts, frozenAccounts, totalHoldingsAgg] = await Promise.all([
        userService.GetUsersCount(),
        Account.countDocuments({ status: "ACTIVE" }),
        Account.countDocuments({ status: "FROZEN" }),
        Account.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$balance" }
                }
            }
        ])
    ]);

    res.status(httpStatus.OK).json({
        status: "success",
        data: {
            totalUsers,
            activeAccounts,
            frozenAccounts,
            totalHoldings: totalHoldingsAgg[0]?.total || 0
        }
    })
})

export const UpdateAccountStatus = catchAsync(
    async (req: Request | any, res: Response, next: NextFunction) => {
        const { accountId } = req.params;
        const { status } = req.body;

        const updatedAccount = await accountService.UpdateAccountStatus(
            accountId,
            status
        );

        if (!updatedAccount) {
            return next(
                new ApiError(
                    httpStatus.NOT_FOUND,
                    "Account not found or status not updated"
                )
            );
        }

        res.status(httpStatus.OK).json({
            status: "success",
            data: updatedAccount
        });
    }
);

export const GetUserStatusCount = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const statusCount = await Account.countDocuments({ status });

    res.status(httpStatus.OK).json({
        status: "success",
        data: statusCount
    });
})