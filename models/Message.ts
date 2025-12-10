import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  from: Types.ObjectId; // User ID (brand or influencer)
  to: Types.ObjectId; // User ID (brand or influencer)
  subject?: string;
  content: string;
  campaignId?: string; // Optional: link to a campaign
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subject: { type: String },
    content: { type: String, required: true },
    campaignId: { type: String },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

MessageSchema.index({ from: 1, to: 1 });
MessageSchema.index({ to: 1, read: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

