"use client";

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Users, LayoutList, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { logParticipantJoined, logParticipantLeft } from "@/lib/eventLogger";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export default function MeetingRoom() {
  const router = useRouter();
  const client = useStreamVideoClient();
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [showConnectionIndicator, setShowConnectionIndicator] = useState(false);

  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  
  // Track previous participants to detect joins/leaves
  const previousParticipantsRef = useRef<Set<string>>(new Set());
  const participantCacheRef = useRef<Map<string, { name: string; image?: string }>>(new Map());
  const callIdRef = useRef<string>("");

  // Monitor connection status
  useEffect(() => {
    if (!client) return;

    console.log("[MeetingRoom] Setting up connection monitoring");

    // Subscribe to connection events
    const unsubscribeConnected = client.on("connection.ok", () => {
      console.log("[MeetingRoom] Client connected");
      setConnectionStatus("connected");
      setShowConnectionIndicator(false);
    });

    const unsubscribeError = client.on("connection.error", (error) => {
      console.error("[MeetingRoom] Connection error:", error);
      setConnectionStatus("disconnected");
      setShowConnectionIndicator(true);
    });

    return () => {
      unsubscribeConnected?.();
      unsubscribeError?.();
    };
  }, [client]);

  // Monitor participant joins and leaves
  useEffect(() => {
    // We need to get the call ID from the URL or from call state
    // For now, we'll extract it from window location if available
    if (!participants) return;

    // Get call ID from URL params
    const callId = typeof window !== "undefined" 
      ? window.location.pathname.split("/").pop()
      : "";

    if (callId) {
      callIdRef.current = callId;
    }

    console.log("[MeetingRoom] Monitoring", participants.length, "participants");

    const currentParticipantIds = new Set<string>();
    const previousParticipantIds = previousParticipantsRef.current;

    // Process current participants
    participants.forEach((participant) => {
      // Use sessionId as unique identifier
      const participantId = participant.sessionId || participant.userId || `unknown-${Math.random()}`;
      const participantName = participant.name || "Anonymous";
      const participantImage = participant.image;

      currentParticipantIds.add(participantId);

      // Cache participant info for later use (e.g., when they leave)
      participantCacheRef.current.set(participantId, {
        name: participantName,
        image: participantImage,
      });

      // Detect new participant (join event)
      if (!previousParticipantIds.has(participantId)) {
        console.log("[MeetingRoom] Participant joined:", participantName);
        if (callIdRef.current) {
          logParticipantJoined(
            callIdRef.current,
            participantId,
            participantName,
            participantImage
          );
        }
      }
    });

    // Detect participants that left
    previousParticipantIds.forEach((participantId) => {
      if (!currentParticipantIds.has(participantId)) {
        const cachedInfo = participantCacheRef.current.get(participantId);
        const participantName = cachedInfo?.name || "Unknown";
        console.log("[MeetingRoom] Participant left:", participantName);
        if (callIdRef.current) {
          logParticipantLeft(
            callIdRef.current,
            participantId,
            participantName
          );
        }
        participantCacheRef.current.delete(participantId);
      }
    });

    // Update previous participants for next comparison
    previousParticipantsRef.current = currentParticipantIds;
  }, [participants]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#15231D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2E7D66]/30 border-t-[#2E7D66] rounded-full animate-spin"></div>
          <p>Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
      case "speaker-left":
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const connectionStatusConfig = {
    connecting: { icon: Wifi, color: "bg-yellow-500", text: "Connecting...", textColor: "text-yellow-400" },
    connected: { icon: Wifi, color: "bg-green-500", text: "Connected", textColor: "text-green-400" },
    reconnecting: { icon: AlertCircle, color: "bg-yellow-500", text: "Reconnecting...", textColor: "text-yellow-400" },
    disconnected: { icon: WifiOff, color: "bg-red-500", text: "Connection Lost", textColor: "text-red-400" },
  };

  const currentStatus = connectionStatusConfig[connectionStatus];
  const StatusIcon = currentStatus.icon;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#15231D] text-white">
      {/* Connection Status Indicator */}
      {showConnectionIndicator && (
        <div className={`absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg ${currentStatus.color} bg-opacity-20 border border-current`}>
          <StatusIcon size={16} className={currentStatus.textColor} />
          <span className={`text-sm font-medium ${currentStatus.textColor}`}>{currentStatus.text}</span>
        </div>
      )}

      <div className="relative flex size-full items-center justify-center p-4">
        <div className="flex size-full max-w-300 items-center">
          <CallLayout />
        </div>
        <div
          className={`h-[calc(100vh-86px)] ml-2 bg-[#1f3027] rounded-lg border border-white/10 ${
            showParticipants ? "block" : "hidden"
          }`}
        >
          {showParticipants && <CallParticipantsList onClose={() => setShowParticipants(false)} />}
        </div>
      </div>
      
      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 w-full flex flex-wrap items-center justify-center gap-4 bg-black/60 p-4 border-t border-white/10">
        <CallControls onLeave={() => router.push("/dashboard")} />

        {/* Layout Switcher */}
        <button 
            onClick={() => setLayout(layout === "grid" ? "speaker-left" : "grid")}
            className="flex items-center justify-center rounded-2xl bg-[#19232d] hover:bg-[#4c535b] p-3 text-white transition-colors"
            title="Toggle Grid/Speaker Layout"
        >
            <LayoutList size={20} />
        </button>
        
        <CallStatsButton />
        
        <button 
            onClick={() => setShowParticipants((prev) => !prev)}
            className="flex items-center justify-center rounded-2xl bg-[#19232d] hover:bg-[#4c535b] p-3 text-white transition-colors"
            title="Show Participants"
        >
          <Users size={20} />
        </button>
      </div>
    </section>
  );
}
