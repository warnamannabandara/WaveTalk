import StreamVideoProvider from "@/components/StreamVideoProvider";

export default function MeetingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-full bg-[#15231D] text-white">
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  );
}
