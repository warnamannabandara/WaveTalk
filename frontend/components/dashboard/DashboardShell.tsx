'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import IncomingCallModal from './IncomingCallModal';
import OutgoingCallModal from './OutgoingCallModal';
import CallWindow from './CallWindow';
import { CallProvider } from '@/contexts/CallContext';

export default function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <CallProvider>
            <div className="flex h-screen bg-[#15231D] text-white overflow-hidden font-sans transition-colors duration-300">
                <aside className="w-64 flex-shrink-0">
                    <Sidebar />
                </aside>
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <div className="flex-1 overflow-auto bg-[#15231D]">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global call overlays — persist across page navigation */}
            <IncomingCallModal />
            <OutgoingCallModal />
            <CallWindow />
        </CallProvider>
    );
}
