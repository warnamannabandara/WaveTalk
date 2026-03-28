"use client";

import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export default function MeetingSetup({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) {
  const call = useCall();
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);

  useEffect(() => {
    if (isMicCamToggledOn) {
      call?.camera.disable();
      call?.microphone.disable();
    } else {
      call?.camera.enable();
      call?.microphone.enable();
    }
  }, [isMicCamToggledOn, call?.camera, call?.microphone]);

  if (!call) return (
     <div className="flex h-screen items-center justify-center text-white bg-[#15231D]">Initializing call...</div>
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 text-white bg-[#15231D]">
      <h1 className="text-3xl font-bold">Meeting Setup</h1>
      <div className="flex flex-col gap-4 items-center">
        <VideoPreview />
        <div className="flex h-16 items-center justify-center gap-3">
          <label className="flex items-center justify-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={isMicCamToggledOn}
              onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-[#22c55e] focus:ring-[#22c55e]"
            />
            Join with mic and camera off
          </label>
          <DeviceSettings />
        </div>
        <button
          className="rounded-md bg-[#22c55e] px-8 py-2.5 text-center font-bold hover:bg-[#16a34a] transition-colors"
          onClick={() => {
            call.join();
            setIsSetupComplete(true);
          }}
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}
