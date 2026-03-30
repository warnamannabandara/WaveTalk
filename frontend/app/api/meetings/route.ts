import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId, title, scheduledAt, participants } = await request.json();

    if (!meetingId) {
      return NextResponse.json(
        { error: "meetingId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newMeeting = new Meeting({
      meetingId,
      hostEmail: session.user.email,
      title: title || "Instant Meeting",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: scheduledAt ? "upcoming" : "active",
      participants: participants || [],
    });

    await newMeeting.save();

    return NextResponse.json(
      { message: "Meeting created successfully", meeting: newMeeting },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Meeting creation error:", error);
    return NextResponse.json(
      { error: "Failed to create meeting", details: error.message },
      { status: 500 }
    );
  }
}
