"use client";

import { useSession } from "next-auth/react";
import { useState, use } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";
import { useGetCallById } from "@/hooks/useGetCallById";

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { call, isCallLoading } = useGetCallById(id);

  if (status === "loading" || isCallLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-white">Loading meeting details...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-white">Please sign in to join a meeting.</p>
      </div>
    );
  }

  if (!call) {
    // Standard error when call not found, but a custom 404 UI can be shown
    return (
      <div className="flex h-screen w-full flex-col gap-4 items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Meeting Not Found</h1>
        <p className="text-gray-400">The meeting you are trying to join does not exist.</p>
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-[#15231D]">
      <StreamCall call={call}>
        <StreamTheme className="h-full">
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
}
