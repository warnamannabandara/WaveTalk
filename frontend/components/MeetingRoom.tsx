"use client";

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users, LayoutList } from "lucide-react";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

export default function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Connecting...
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

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#15231D] text-white">
      <div className="relative flex size-full items-center justify-center p-4">
        <div className="flex size-full max-w-[1200px] items-center">
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
