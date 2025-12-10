import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInfluencerProfile extends Document {
  user: Types.ObjectId;
  category?: string; // e.g., "Food & Lifestyle", "Fashion", "Beauty"
  location?: string;
  bio?: string;
  pricing?: {
    perPost?: number;
    perReel?: number;
    perStory?: number;
    package?: number;
  };
  contactEmail?: string;
  contactWhatsApp?: string;
  website?: string;
  isPublic: boolean; // Whether profile is visible to brands
  createdAt: Date;
  updatedAt: Date;
}

const InfluencerProfileSchema = new Schema<IInfluencerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    category: { type: String },
    location: { type: String, index: true },
    bio: { type: String },
    pricing: {
      perPost: { type: Number },
      perReel: { type: Number },
      perStory: { type: Number },
      package: { type: Number }
    },
    contactEmail: { type: String },
    contactWhatsApp: { type: String },
    website: { type: String },
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

InfluencerProfileSchema.index({ category: 1, location: 1 });
InfluencerProfileSchema.index({ isPublic: 1 });

export const InfluencerProfile: Model<IInfluencerProfile> =
  mongoose.models.InfluencerProfile ||
  mongoose.model<IInfluencerProfile>("InfluencerProfile", InfluencerProfileSchema);

