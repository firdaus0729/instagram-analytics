import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  role: "influencer" | "brand" | "admin";
  isVerified?: boolean;
  isApproved?: boolean; // For influencer approval by admin
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // Optional for OAuth users
    name: { type: String },
    role: {
      type: String,
      enum: ["influencer", "brand", "admin"],
      default: "influencer"
    },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false } // Influencers need approval
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


