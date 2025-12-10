import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";

// GET: Get messages for current user
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const messages = await Message.find({
    $or: [{ from: user._id }, { to: user._id }]
  })
    .populate("from", "name email")
    .populate("to", "name email")
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ messages });
}

// POST: Send a message
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await req.json();
  const { to, subject, content, campaignId } = body;

  if (!to || !content) {
    return NextResponse.json(
      { error: "Recipient and content are required" },
      { status: 400 }
    );
  }

  const message = await Message.create({
    from: user._id,
    to,
    subject,
    content,
    campaignId,
    read: false
  });

  return NextResponse.json({ success: true, message });
}

