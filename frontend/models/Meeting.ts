import mongoose from "mongoose";

export interface IMeeting extends mongoose.Document {
  meetingId: string;
  hostEmail: string;
  title: string;
  scheduledAt?: Date;
  status: "upcoming" | "active" | "past";
  participants: string[];
}

const MeetingSchema = new mongoose.Schema<IMeeting>(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    hostEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Instant Meeting",
    },
    scheduledAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "past"],
      default: "upcoming",
    },
    participants: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
