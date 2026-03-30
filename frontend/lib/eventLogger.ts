/**
 * Event Logger for tracking participant actions in meetings
 * Logs events to the API for persistence and analytics
 */

export type ParticipantEventType = "participant.joined" | "participant.left" | "participant.muted" | "participant.unmuted";

export interface ParticipantEvent {
  callId: string;
  eventType: ParticipantEventType;
  participantId: string;
  participantName: string;
  participantImage?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Log a participant event to the API
 * @param callId - The meeting/call ID
 * @param event - The event details
 */
export async function logParticipantEvent(
  callId: string,
  event: Omit<ParticipantEvent, "callId" | "timestamp">
): Promise<void> {
  try {
    const eventPayload: ParticipantEvent = {
      ...event,
      callId,
      timestamp: new Date().toISOString(),
    };

    console.log("[EventLogger] Logging event:", eventPayload);

    const response = await fetch(`/api/meetings/${callId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      console.warn(`[EventLogger] Failed to log event: ${response.status}`);
      return;
    }

    console.log("[EventLogger] Event logged successfully");
  } catch (error) {
    console.error("[EventLogger] Error logging event:", error);
    // Fail silently - event logging should not interrupt the meeting
  }
}

/**
 * Log participant join event
 */
export function logParticipantJoined(
  callId: string,
  participantId: string,
  participantName: string,
  participantImage?: string
): Promise<void> {
  return logParticipantEvent(callId, {
    eventType: "participant.joined",
    participantId,
    participantName,
    participantImage,
  });
}

/**
 * Log participant left event
 */
export function logParticipantLeft(
  callId: string,
  participantId: string,
  participantName: string
): Promise<void> {
  return logParticipantEvent(callId, {
    eventType: "participant.left",
    participantId,
    participantName,
  });
}

/**
 * Log participant muted event
 */
export function logParticipantMuted(
  callId: string,
  participantId: string,
  participantName: string,
  type: "audio" | "video"
): Promise<void> {
  return logParticipantEvent(callId, {
    eventType: "participant.muted",
    participantId,
    participantName,
    metadata: { muteType: type },
  });
}

/**
 * Log participant unmuted event
 */
export function logParticipantUnmuted(
  callId: string,
  participantId: string,
  participantName: string,
  type: "audio" | "video"
): Promise<void> {
  return logParticipantEvent(callId, {
    eventType: "participant.unmuted",
    participantId,
    participantName,
    metadata: { unmuteType: type },
  });
}
