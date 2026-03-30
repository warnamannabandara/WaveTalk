import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Define a simple schema for meeting events
const eventSchema = new mongoose.Schema(
  {
    callId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    participantId: { type: String, required: true },
    participantName: { type: String, required: true },
    participantImage: String,
    timestamp: { type: Date, required: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: "recordedAt" } }
);

const MeetingEvent =
  mongoose.models.MeetingEvent ||
  mongoose.model("MeetingEvent", eventSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: callId } = await params;

    // Validate call ID
    if (!callId) {
      return NextResponse.json(
        { error: "Missing call ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const event = await request.json();

    // Validate event structure
    if (!event.eventType || !event.participantId || !event.participantName) {
      return NextResponse.json(
        { error: "Missing required event fields" },
        { status: 400 }
      );
    }

    console.log("[Events API] Received event:", {
      callId,
      eventType: event.eventType,
      participantId: event.participantId,
    });

    // Connect to database
    await connectDB();

    // Insert event
    const newEvent = new MeetingEvent({
      callId,
      eventType: event.eventType,
      participantId: event.participantId,
      participantName: event.participantName,
      participantImage: event.participantImage || null,
      timestamp: new Date(event.timestamp),
      metadata: event.metadata || {},
    });

    const result = await newEvent.save();

    console.log("[Events API] Event stored successfully:", result._id);

    return NextResponse.json({
      success: true,
      eventId: result._id,
    });
  } catch (error: any) {
    console.error("[Events API] Error storing event:", error);
    
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve events for a specific call
 * Query params:
 * - eventType?: Filter by event type
 * - startTime?: ISO timestamp for start of range
 * - endTime?: ISO timestamp for end of range
 * - limit?: Number of events to return (default: 100, max: 1000)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: callId } = await params;

    // Validate call ID
    if (!callId) {
      return NextResponse.json(
        { error: "Missing call ID" },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get("eventType");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);

    console.log("[Events API] Fetching events for call:", callId);

    // Connect to database
    await connectDB();

    // Build query
    const query: Record<string, any> = { callId };

    if (eventType) {
      query.eventType = eventType;
    }

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) {
        query.timestamp.$gte = new Date(startTime);
      }
      if (endTime) {
        query.timestamp.$lte = new Date(endTime);
      }
    }

    // Fetch events
    const events = await MeetingEvent.find(query)
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();

    console.log("[Events API] Retrieved", events.length, "events");

    return NextResponse.json({
      success: true,
      callId,
      eventCount: events.length,
      events,
    });
  } catch (error: any) {
    console.error("[Events API] Error fetching events:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
