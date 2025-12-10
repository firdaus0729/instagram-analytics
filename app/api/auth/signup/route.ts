import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role = "influencer" } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      isVerified: true, // Auto-verify for now
      isApproved: role === "brand" ? true : false // Brands auto-approved, influencers need approval
    });

    // Create influencer profile if role is influencer
    if (role === "influencer") {
      await InfluencerProfile.create({
        user: user._id,
        isPublic: false, // Not public until approved
        category: "Other", // Default category
        bio: "New influencer profile" // Default bio
      });
    }

    // Create session
    await createSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

