import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInstagramInsight extends Document {
  instagramAccount: Types.ObjectId;
  metric: string;
  period: "day" | "week" | "days_28" | "lifetime";
  value: number;
  breakdown?: Record<string, number>;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramInsightSchema = new Schema<IInstagramInsight>(
  {
    instagramAccount: {
      type: Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true
    },
    metric: { type: String, required: true, index: true },
    period: {
      type: String,
      enum: ["day", "week", "days_28", "lifetime"],
      required: true
    },
    value: { type: Number, required: true },
    breakdown: { type: Schema.Types.Mixed },
    date: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

InstagramInsightSchema.index(
  { instagramAccount: 1, metric: 1, date: -1 },
  { name: "insight_metric_date_idx" }
);

export const InstagramInsight: Model<IInstagramInsight> =
  mongoose.models.InstagramInsight ||
  mongoose.model<IInstagramInsight>("InstagramInsight", InstagramInsightSchema);


