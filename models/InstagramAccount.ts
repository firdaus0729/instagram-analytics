import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInstagramAccount extends Document {
  user: Types.ObjectId;
  instagramUserId: string;
  username: string;
  accountType: "BUSINESS" | "CREATOR" | "PERSONAL" | "UNKNOWN";
  profilePictureUrl?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  accessToken: string;
  longLivedToken?: string;
  tokenExpiresAt?: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instagramUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true, index: true },
    accountType: {
      type: String,
      enum: ["BUSINESS", "CREATOR", "PERSONAL", "UNKNOWN"],
      default: "UNKNOWN",
      index: true
    },
    profilePictureUrl: { type: String },
    biography: { type: String },
    followersCount: { type: Number },
    followsCount: { type: Number },
    accessToken: { type: String, required: true },
    longLivedToken: { type: String },
    tokenExpiresAt: { type: Date, index: true },
    lastSyncedAt: { type: Date }
  },
  { timestamps: true }
);

InstagramAccountSchema.index({ user: 1, instagramUserId: 1 }, { unique: true });

export const InstagramAccount: Model<IInstagramAccount> =
  mongoose.models.InstagramAccount ||
  mongoose.model<IInstagramAccount>("InstagramAccount", InstagramAccountSchema);


