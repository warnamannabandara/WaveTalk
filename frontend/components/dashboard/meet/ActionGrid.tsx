"use client";

import { Video, Plus, Calendar, Share, Loader2 } from "lucide-react";
import { useState } from "react";

interface ActionGridProps {
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
  onShareScreen: () => void;
  isStarting: boolean;
}

export default function ActionGrid({
  onNewMeeting,
  onJoin,
  onSchedule,
  onShareScreen,
  isStarting
}: ActionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-8 max-w-2xl">
      {/* New Meeting - Orange style */}
      <button
        onClick={onNewMeeting}
        disabled={isStarting}
        className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-orange-500 hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
      >
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm group-hover:rotate-6 transition-transform">
          {isStarting ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Video className="w-10 h-10 fill-current" />
          )}
        </div>
        <span className="text-white font-semibold text-lg">
          {isStarting ? "Starting..." : "New Meeting"}
        </span>
      </button>

      {/* Join Meeting - Blue style */}
      <button
        onClick={onJoin}
        className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 active:scale-95"
      >
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm group-hover:-rotate-6 transition-transform">
          <Plus className="w-10 h-10" />
        </div>
        <span className="text-white font-semibold text-lg">Join</span>
      </button>

      {/* Schedule - Blue style */}
      <button
        onClick={onSchedule}
        className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 active:scale-95"
      >
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm group-hover:rotate-12 transition-transform">
          <Calendar className="w-10 h-10" />
        </div>
        <span className="text-white font-semibold text-lg">Schedule</span>
      </button>

      {/* Share Screen - Blue style */}
      <button
        onClick={onShareScreen}
        className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 active:scale-95"
      >
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm group-hover:-rotate-12 transition-transform">
          <Share className="w-10 h-10" />
        </div>
        <span className="text-white font-semibold text-lg">Share Screen</span>
      </button>
    </div>
  );
}
