import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Transfer from "./transfer.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
    ITransferDoc,
    UpdateTransferInfo,
    NewCreatedTransfer,
} from "./transfer.interface";

/**
 * Create a transfer
 * @param {NewCreatedTransfer} transferBody
 * @returns {Promise<ITransferDoc>}
 */
export const createTransfer = async (
    transferBody: NewCreatedTransfer
): Promise<ITransferDoc> => {
    return Transfer.create(transferBody);
};

/**
 * Query for transfers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryTransfers = async (
    filter: Record<string, any>,
    options: IOptions
): Promise<QueryResult> => {
    const transfers = await Transfer.paginate(filter, options);
    return transfers;
};

/**
 * Get transfer by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITransferDoc | null>}
 */
export const getTransferById = async (
    id: mongoose.Types.ObjectId
): Promise<ITransferDoc | null> => Transfer.findById(id);

/**
 * Get transfer by reference number
 * @param {string} referenceNumber
 * @returns {Promise<ITransferDoc | null>}
 */
export const getTransferByReferenceNumber = async (
    referenceNumber: string
): Promise<ITransferDoc | null> => Transfer.findOne({ referenceNumber });

/**
 * Update transfer by id
 * @param {mongoose.Types.ObjectId} transferId
 * @param {UpdateTransferInfo} updateBody
 * @returns {Promise<ITransferDoc | null>}
 */
export const updateTransferById = async (
    transferId: Types.ObjectId,
    updateBody: UpdateTransferInfo
): Promise<ITransferDoc | null> => {
    const transfer = await getTransferById(transferId);
    if (!transfer) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transfer not found");
    }
    if (
        updateBody.referenceNumber &&
        (await Transfer.isReferenceNumberTaken(updateBody.referenceNumber, transferId))
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reference number already taken");
    }
    Object.assign(transfer, updateBody);
    await transfer.save();
    return transfer;
};

/**
 * Delete transfer by id
 * @param {mongoose.Types.ObjectId} transferId
 * @returns {Promise<ITransferDoc | null>}
 */
export const deleteTransferById = async (
    transferId: mongoose.Types.ObjectId
): Promise<ITransferDoc | null> => {
    const transfer = await Transfer.findByIdAndDelete(transferId);
    if (!transfer) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transfer not found");
    }
    return transfer;
};