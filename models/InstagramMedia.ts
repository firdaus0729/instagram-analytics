import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInstagramMedia extends Document {
  instagramAccount: Types.ObjectId;
  mediaId: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REEL" | "STORY" | "UNKNOWN";
  mediaUrl: string;
  permalink?: string;
  caption?: string;
  likeCount?: number;
  commentsCount?: number;
  shareCount?: number;
  savedCount?: number;
  impressions?: number;
  reach?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramMediaSchema = new Schema<IInstagramMedia>(
  {
    instagramAccount: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true
    },
    mediaId: { type: String, required: true, unique: true },
    mediaType: {
      type: String,
      enum: ["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REEL", "STORY", "UNKNOWN"],
      default: "UNKNOWN",
      index: true
    },
    mediaUrl: { type: String, required: true },
    permalink: { type: String },
    caption: { type: String },
    likeCount: { type: Number },
    commentsCount: { type: Number },
    shareCount: { type: Number },
    savedCount: { type: Number },
    impressions: { type: Number },
    reach: { type: Number },
    timestamp: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

InstagramMediaSchema.index(
  { instagramAccount: 1, timestamp: -1 },
  { name: "account_timestamp_idx" }
);

export const InstagramMedia: Model<IInstagramMedia> =
  mongoose.models.InstagramMedia ||
  mongoose.model<IInstagramMedia>("InstagramMedia", InstagramMediaSchema);


