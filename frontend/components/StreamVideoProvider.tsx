"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient, User } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function StreamVideoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) return;
    if (!apiKey) {
      console.error("Stream API key is missing. Check .env.local file.");
      return;
    }

    const initClient = async () => {
      try {
        const response = await fetch("/api/stream/token");
        
        if (!response.ok) {
           throw new Error("Failed to get stream token");
        }
        
        const data = await response.json();
        const { token, id } = data;

        const user: User = {
          id: id,
          name: session?.user?.name || session?.user?.email || "Guest",
          image: session?.user?.image || `https://getstream.io/random_png/?id=${id}&name=${session?.user?.name || "User"}`,
        };

        const client = new StreamVideoClient({
          apiKey,
          user,
          token,
        });

        // Use mount/unmount effect cleanup safely
        setVideoClient(client);
      } catch (error) {
        console.error("Stream initialization error:", error);
      }
    };

    initClient();
  }, [session, status]);

  if (!videoClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-white">Loading Video Client...</p>
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
