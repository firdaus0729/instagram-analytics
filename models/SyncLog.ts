import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SyncType = "profile" | "media" | "insights" | "all";

export interface ISyncLog extends Document {
  instagramAccount: Types.ObjectId;
  syncType: SyncType;
  status: "success" | "partial" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
  meta?: Record<string, unknown>;
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    instagramAccount: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true
    },
    syncType: {
      type: String,
      enum: ["profile", "media", "insights", "all"],
      required: true
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "success",
      index: true
    },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    errorMessage: { type: String },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

SyncLogSchema.index({ instagramAccount: 1, startedAt: -1 });

export const SyncLog: Model<ISyncLog> =
  mongoose.models.SyncLog || mongoose.model<ISyncLog>("SyncLog", SyncLogSchema);


