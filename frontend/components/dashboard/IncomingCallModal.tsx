'use client';

import { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '@/contexts/CallContext';

export default function IncomingCallModal() {
    const { incomingCall, acceptCall, declineCall } = useCall();
    const [remaining, setRemaining] = useState(30);

    // Countdown + auto-decline at 0
    useEffect(() => {
        if (!incomingCall) { setRemaining(30); return; }
        setRemaining(30);
        const interval = setInterval(() => {
            setRemaining(v => {
                if (v <= 1) { clearInterval(interval); declineCall(); return 0; }
                return v - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incomingCall?.callId]);

    if (!incomingCall) return null;

    const { caller, type } = incomingCall;
    const initials = caller.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-3xl p-8 w-[320px] flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Pulsing avatar ring */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute w-28 h-28 rounded-full bg-emerald-500/15 animate-ping [animation-duration:1.2s]" />
                    <span className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-ping [animation-duration:1.6s] [animation-delay:0.3s]" />
                    <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-800/60 border-2 border-emerald-500/60 flex items-center justify-center text-2xl font-bold text-emerald-200 overflow-hidden">
                        {caller.avatar
                            ? <img src={caller.avatar} alt="" className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>
                </div>

                {/* Call info */}
                <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                        Incoming {type === 'video' ? 'Video' : 'Voice'} Call
                    </p>
                    <h2 className="text-xl font-bold text-white">{caller.name}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{caller.email}</p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center gap-1.5">
                        <button
                            onClick={declineCall}
                            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-900/40"
                        >
                            <PhoneOff className="w-6 h-6 text-white" />
                        </button>
                        <span className="text-[10px] text-gray-500">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <button
                            onClick={acceptCall}
                            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-900/40 animate-bounce [animation-duration:1s]"
                        >
                            {type === 'video'
                                ? <Video className="w-6 h-6 text-white" />
                                : <Phone className="w-6 h-6 text-white" />
                            }
                        </button>
                        <span className="text-[10px] text-gray-500">Accept</span>
                    </div>
                </div>

                <p className="text-xs text-gray-600">Auto-declining in {remaining}s</p>
            </div>
        </div>
    );
}
