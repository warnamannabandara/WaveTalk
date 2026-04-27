'use client';

import { useEffect, useState } from 'react';
import { PhoneOff } from 'lucide-react';
import { useCall } from '@/contexts/CallContext';

export default function OutgoingCallModal() {
    const { outgoingCall, endCall } = useCall();
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!outgoingCall) return;
        const interval = setInterval(() => setDots(v => v.length >= 3 ? '' : v + '.'), 500);
        return () => clearInterval(interval);
    }, [outgoingCall?.callId]);

    if (!outgoingCall) return null;

    const initials = outgoingCall.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-3xl p-8 w-[320px] flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Slow pulsing ring */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute w-28 h-28 rounded-full bg-emerald-500/10 animate-ping [animation-duration:2s]" />
                    <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-800/60 border-2 border-emerald-600/40 flex items-center justify-center text-2xl font-bold text-emerald-200 overflow-hidden">
                        {outgoingCall.avatar
                            ? <img src={outgoingCall.avatar} alt="" className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                        {outgoingCall.type === 'video' ? 'Video' : 'Voice'} Calling{dots}
                    </p>
                    <h2 className="text-xl font-bold text-white">{outgoingCall.name}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{outgoingCall.email}</p>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <button
                        onClick={endCall}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-900/40"
                    >
                        <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-[10px] text-gray-500">Cancel</span>
                </div>
            </div>
        </div>
    );
}
