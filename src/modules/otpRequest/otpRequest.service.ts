import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import OtpRequest from "./otpRequest.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  IOtpRequestDoc,
  UpdateOtpRequestInfo,
  NewCreatedOtpRequest,
} from "./otpRequest.interface";

/**
 * Create an OTP request
 * @param {NewCreatedOtpRequest} otpRequestBody
 * @returns {Promise<IOtpRequestDoc>}
 */
export const createOtpRequest = async (
  otpRequestBody: NewCreatedOtpRequest
): Promise<IOtpRequestDoc> => {
  return OtpRequest.create(otpRequestBody);
};

/**
 * Query for OTP requests
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryOtpRequests = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const otpRequests = await OtpRequest.paginate(filter, options);
  return otpRequests;
};

/**
 * Get OTP request by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IOtpRequestDoc | null>}
 */
export const getOtpRequestById = async (
  id: mongoose.Types.ObjectId
): Promise<IOtpRequestDoc | null> => OtpRequest.findById(id);

/**
 * Get OTP request by transaction ID and OTP
 * @param {string} transactionId
 * @param {string} otp
 * @returns {Promise<IOtpRequestDoc | null>}
 */
export const getOtpRequestByTransactionAndOtp = async (
  transactionId: string,
  otp: string
): Promise<IOtpRequestDoc | null> => OtpRequest.findOne({ transactionId, otp });

/**
 * Update OTP request by id
 * @param {mongoose.Types.ObjectId} otpRequestId
 * @param {UpdateOtpRequestInfo} updateBody
 * @returns {Promise<IOtpRequestDoc | null>}
 */
export const updateOtpRequestById = async (
  otpRequestId: Types.ObjectId,
  updateBody: UpdateOtpRequestInfo
): Promise<IOtpRequestDoc | null> => {
  const otpRequest = await getOtpRequestById(otpRequestId);
  if (!otpRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP request not found");
  }
  Object.assign(otpRequest, updateBody);
  await otpRequest.save();
  return otpRequest;
};

/**
 * Delete OTP request by id
 * @param {mongoose.Types.ObjectId} otpRequestId
 * @returns {Promise<IOtpRequestDoc | null>}
 */
export const deleteOtpRequestById = async (
  otpRequestId: mongoose.Types.ObjectId
): Promise<IOtpRequestDoc | null> => {
  const otpRequest = await OtpRequest.findByIdAndDelete(otpRequestId);
  if (!otpRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP request not found");
  }
  return otpRequest;
};

/**
 * Validate OTP
 * @param {string} transactionId
 * @param {string} otp
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const validateOtp = async (
  transactionId: string,
  otp: string,
  userId: string
): Promise<{ isValid: boolean; otpRequest?: IOtpRequestDoc }> => {
  const otpRequest = await OtpRequest.findOne({
    transactionId,
    otp,
    userId,
    isUsed: false
  });

  if (!otpRequest) {
    return { isValid: false };
  }

  // Check if OTP is expired
  if (new Date() > otpRequest.otpExpiredAt) {
    return { isValid: false };
  }

  // Mark OTP as used and verified
  otpRequest.isUsed = true;
  otpRequest.verifiedAt = new Date();
  await otpRequest.save();

  return { isValid: true, otpRequest };
};