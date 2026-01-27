import httpStatus from "http-status";
import mongoose from "mongoose";

import { IReferralLinkDoc } from "./referrallink.interface";
import ReferralLink from "./referrallink.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from "../paginate/paginate";

/**
 * Get document by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IReferralLinkDoc | null>}
 */
export const getReferralLinkById = async (
  id: mongoose.Types.ObjectId
): Promise<IReferralLinkDoc | null> => ReferralLink.findById(id);

/**
 * check if Affliate has created a link with same course
 * @param {mongoose.Types.ObjectId} affiliateId
 * @param {mongoose.Types.ObjectId} courseId
 * @returns {Promise<boolean>}
 */
export const checkIfLinkExists = async (
  affiliateId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId
): Promise<boolean> => {
  try {
    const affId =
      typeof affiliateId === "string"
        ? new mongoose.Types.ObjectId(affiliateId)
        : affiliateId;
    const crsId =
      typeof courseId === "string"
        ? new mongoose.Types.ObjectId(courseId)
        : courseId;

    // Check if referral link exists with same affiliate and course
    const referralLink = await ReferralLink.findOne({
      AffliateId: affId,
      CourseId: crsId,
    });

    return !!referralLink; // Return true if the link exists, otherwise false
  } catch (error) {
    console.error("Error checking referral link:", error);
    throw new ApiError(401, "Link for this course already exists");
  }
};

/**
 * Query for ReferralLinks
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryDocs = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const docs = await ReferralLink.paginate(filter, options);
  return docs;
};

/**
 * Get referral links created by affliate id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IReferralLinkDoc | null>}
 */
export const getCourseCreatedId = async (
  id: mongoose.Types.ObjectId
): Promise<IReferralLinkDoc | null> => {
  const docs = (await ReferralLink.find({ AffliateId: id })) as any;
  return docs;
};
