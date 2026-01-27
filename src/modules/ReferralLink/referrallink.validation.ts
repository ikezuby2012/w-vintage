import { NewReferralLink } from "./referrallink.interface";

const Joi = require("joi");

const newCourseBody: Record<keyof NewReferralLink, any> = {
  AffliateId: Joi.string().required(),
  CourseId: Joi.string().required(),
  expired_at: Joi.string(),
};

export const createNewCourse = {
  body: Joi.object().keys(newCourseBody),
};
