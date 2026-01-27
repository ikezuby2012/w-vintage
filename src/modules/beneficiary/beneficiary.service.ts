import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Beneficiary from "./beneficiary.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  IBeneficiaryDoc,
  UpdateBeneficiaryInfo,
  NewCreatedBeneficiary,
} from "./beneficiary.interface";

/**
 * Create a beneficiary
 * @param {NewCreatedBeneficiary} beneficiaryBody
 * @returns {Promise<IBeneficiaryDoc>}
 */
export const createBeneficiary = async (
  beneficiaryBody: NewCreatedBeneficiary
): Promise<IBeneficiaryDoc> => {
  return Beneficiary.create(beneficiaryBody);
};

/**
 * Query for beneficiaries
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryBeneficiaries = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const beneficiaries = await Beneficiary.paginate(filter, options);
  return beneficiaries;
};

/**
 * Get beneficiary by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBeneficiaryDoc | null>}
 */
export const getBeneficiaryById = async (
  id: mongoose.Types.ObjectId
): Promise<IBeneficiaryDoc | null> => Beneficiary.findById(id);

/**
 * Get beneficiary by account number and bank code
 * @param {string} accountNumber
 * @param {string} bankCode
 * @returns {Promise<IBeneficiaryDoc | null>}
 */
export const getBeneficiaryByAccount = async (
  accountNumber: string,
  bankCode: string
): Promise<IBeneficiaryDoc | null> => Beneficiary.findOne({ accountNumber, bankCode });

/**
 * Update beneficiary by id
 * @param {mongoose.Types.ObjectId} beneficiaryId
 * @param {UpdateBeneficiaryInfo} updateBody
 * @returns {Promise<IBeneficiaryDoc | null>}
 */
export const updateBeneficiaryById = async (
  beneficiaryId: Types.ObjectId,
  updateBody: UpdateBeneficiaryInfo
): Promise<IBeneficiaryDoc | null> => {
  const beneficiary = await getBeneficiaryById(beneficiaryId);
  if (!beneficiary) {
    throw new ApiError(httpStatus.NOT_FOUND, "Beneficiary not found");
  }
  if (
    updateBody.accountNumber &&
    updateBody.bankCode &&
    (await Beneficiary.isBeneficiaryTaken(updateBody.accountNumber, updateBody.bankCode, beneficiaryId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Beneficiary already exists");
  }
  Object.assign(beneficiary, updateBody);
  await beneficiary.save();
  return beneficiary;
};

/**
 * Delete beneficiary by id
 * @param {mongoose.Types.ObjectId} beneficiaryId
 * @returns {Promise<IBeneficiaryDoc | null>}
 */
export const deleteBeneficiaryById = async (
  beneficiaryId: mongoose.Types.ObjectId
): Promise<IBeneficiaryDoc | null> => {
  const beneficiary = await Beneficiary.findByIdAndDelete(beneficiaryId);
  if (!beneficiary) {
    throw new ApiError(httpStatus.NOT_FOUND, "Beneficiary not found");
  }
  return beneficiary;
};