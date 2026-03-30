"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { StreamVideo, StreamVideoClient, User } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

// Token refresh buffer in seconds (refresh 5 min before expiration)
const TOKEN_REFRESH_BUFFER = 30;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function StreamVideoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: session, status } = useSession();
  const retryCountRef = useRef(0);
  const tokenExpiryRef = useRef<number | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch token from API with retry logic
  const fetchToken = async (retryCount = 0): Promise<{ token: string; id: string } | null> => {
    try {
      console.log(`[Stream] Fetching token (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      const response = await fetch("/api/stream/token");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Token fetch failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const { token, id } = data;

      if (!token || !id) {
        throw new Error("Invalid token response: missing token or user ID");
      }

      console.log("[Stream] Token fetched successfully");
      return { token, id };
    } catch (error: any) {
      console.error(`[Stream] Token fetch error (attempt ${retryCount + 1}):`, error.message);
      
      if (retryCount < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
        return fetchToken(retryCount + 1);
      }
      
      return null;
    }
  };

  // Initialize Stream video client
  const initClient = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("[Stream] Starting client initialization...");

      // Fetch token
      const tokenData = await fetchToken();
      if (!tokenData) {
        throw new Error("Failed to obtain authentication token after multiple attempts. Please check your connection and try again.");
      }

      const { token, id } = tokenData;

      // Validate API key
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error("Stream API key is missing or invalid. Please update NEXT_PUBLIC_STREAM_API_KEY in your .env.local file.");
      }

      // Create user object
      const user: User = {
        id: id,
        name: session?.user?.name || session?.user?.email || "Guest",
        image: session?.user?.image || `https://getstream.io/random_png/?id=${id}&name=${session?.user?.name || "User"}`,
      };

      console.log("[Stream] Creating StreamVideoClient for user:", user.id);

      // Create Stream client
      const client = new StreamVideoClient({
        apiKey,
        user,
        token,
      });

      // Set token expiry (tokens are valid for 1 hour by default)
      tokenExpiryRef.current = Math.floor(Date.now() / 1000) + 3600;

      // Schedule token refresh before expiration
      scheduleTokenRefresh();

      setVideoClient(client);
      retryCountRef.current = 0;
      setIsConnecting(false);
      console.log("[Stream] Client initialized successfully");
    } catch (error: any) {
      console.error("[Stream] Initialization error:", error);
      setError(error.message || "Failed to initialize video service. Please try again.");
      setIsConnecting(false);
    }
  };

  // Schedule token refresh 5 minutes before expiration
  const scheduleTokenRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiryTime = tokenExpiryRef.current;
    if (!expiryTime) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiryTime - now;
    const refreshTime = Math.max(0, (timeUntilExpiry - TOKEN_REFRESH_BUFFER) * 1000);

    console.log("[Stream] Token will refresh in", Math.floor(refreshTime / 1000), "seconds");

    refreshTimeoutRef.current = setTimeout(() => {
      console.log("[Stream] Refreshing token...");
      initClient();
    }, refreshTime);
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      console.log("[Stream] No session, skipping initialization");
      setVideoClient(null);
      return;
    }

    console.log("[Stream] Session detected, initializing client...");
    initClient();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session, status]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F1613] p-6 text-white text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-lg shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-500 mb-2">Meeting Service Unavailable</h2>
          <p className="text-gray-400 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setError(null);
                setIsConnecting(false);
                retryCountRef.current = 0;
                initClient();
              }}
              disabled={isConnecting}
              className="px-6 py-2 bg-[#2E7D66] hover:bg-[#256653] disabled:opacity-50 rounded-xl transition-colors font-medium text-white"
            >
              {isConnecting ? "Retrying..." : "Try Again"}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors font-medium text-white"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!videoClient || isConnecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F1613]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2E7D66]/30 border-t-[#2E7D66] rounded-full animate-spin"></div>
          <p className="text-white text-sm">Connecting to meeting service...</p>
          <p className="text-gray-500 text-xs">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
