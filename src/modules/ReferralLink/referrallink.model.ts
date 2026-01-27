import mongoose, { Schema, Query } from "mongoose";

import toJSON from "../toJSON/toJSON";
import paginate from "../paginate/paginate";
import { IReferralLinkDoc, IReferralLinkModel } from "./referrallink.interface";

const referrallinkSchema = new mongoose.Schema<
  IReferralLinkDoc,
  IReferralLinkModel
>(
  {
    expired: Boolean,
    Link: {
        type: String,
        unique: true,
        trim: true,
    },
    AffliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Affliate id is required"],
    },
    CourseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course id is required"],
    },
    expired_at: Date,
    isSoftDeleted: {
      type: Boolean,
      select: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

referrallinkSchema.pre(/^find/, function (this: Query<any, any>, next) {
  const query = this.getQuery();
  query.isSoftDeleted = { $ne: true };
  next();
});

referrallinkSchema.pre<IReferralLinkDoc>(/^find/, function (next) {
  this.populate({
    path: "AffliateId CourseId",
  });
  next();
});

// add plugin that converts mongoose to json
referrallinkSchema.plugin(toJSON);
referrallinkSchema.plugin(paginate as any);

const ReferralLink = mongoose.model<IReferralLinkDoc, IReferralLinkModel>("ReferralLink", referrallinkSchema);
export default ReferralLink;