"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function HomeClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeString = format(time, "HH:mm");
  const amPm = format(time, "a");
  const dateString = format(time, "EEEE, MMMM d, yyyy");

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[#1A231F] border border-[#2A3430] p-8 flex flex-col justify-end shadow-2xl">
      {/* Visual flourish: Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-bold text-white tracking-tight">
            {timeString}
          </h2>
          <span className="text-2xl font-medium text-emerald-500/80 uppercase">
            {amPm}
          </span>
        </div>
        <p className="mt-2 text-xl font-medium text-emerald-100/60 leading-none">
          {dateString}
        </p>
      </div>
      
      {/* Decorative blurred circle */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
