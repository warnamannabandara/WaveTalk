"use client";

import { useSession } from "next-auth/react";
import { useState, use } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";
import { useGetCallById } from "@/hooks/useGetCallById";
import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { call, isCallLoading, error: callError } = useGetCallById(id);

  // Loading state
  if (status === "loading" || isCallLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#15231D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2E7D66]/30 border-t-[#2E7D66] rounded-full animate-spin"></div>
          <p className="text-white text-sm">Loading meeting details...</p>
          <p className="text-gray-500 text-xs">Please wait while we prepare the meeting</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#15231D] p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <h1 className="text-2xl font-bold text-white">Sign In Required</h1>
          <p className="text-gray-400">You need to be signed in to join a meeting.</p>
          <Link
            href="/signin"
            className="px-6 py-2 bg-[#2E7D66] hover:bg-[#256653] rounded-lg text-white font-medium transition-colors mt-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Call loading error or not found
  if (callError || !call) {
    const isNotFound = callError?.includes("not found") || !call;
    
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#15231D] p-6">
        <div className="flex flex-col items-center gap-6 text-center max-w-lg bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-500 mb-2">
              {isNotFound ? "Meeting Not Found" : "Unable to Load Meeting"}
            </h1>
            <p className="text-gray-400">
              {isNotFound
                ? `The meeting ${id} does not exist or has expired. It may have already started or been removed.`
                : `There was an error loading the meeting details. ${callError ? `Error: ${callError}` : ''}`}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full pt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#2E7D66] hover:bg-[#256653] rounded-lg text-white font-medium transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t border-gray-600/50 w-full">
            <p>Meeting ID: <code className="text-gray-400">{id}</code></p>
          </div>
        </div>
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
