"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MeetHeader from '@/components/dashboard/meet/MeetHeader';
import MeetTabs from '@/components/dashboard/meet/MeetTabs';
import JoinMeeting from '@/components/dashboard/meet/JoinMeeting';
import ScheduleMeeting from '@/components/dashboard/meet/ScheduleMeeting';
import UpcomingMeetings from '@/components/dashboard/meet/UpcomingMeetings';
import ActiveMeeting from '@/components/dashboard/meet/ActiveMeeting';
import api from '@/lib/api';

function MeetPageInner() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') ?? 'join';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

    // Read initial meeting state from sessionStorage
    useEffect(() => {
        const storedMeetingId = sessionStorage.getItem('activeMeetingId');
        if (storedMeetingId) {
            setActiveMeetingId(storedMeetingId);
        }
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    // Auto-join when navigated from chat video call button
    useEffect(() => {
        const meetingId = searchParams.get('meetingId');
        const autoJoin = searchParams.get('autoJoin');
        if (meetingId && autoJoin === 'true') {
            sessionStorage.setItem('activeMeetingId', meetingId);
            setActiveMeetingId(meetingId);
        }
    }, [searchParams]);

    // Auto-join from invite link (?join=<meetingId>)
    useEffect(() => {
        const joinId = searchParams.get('join');
        if (!joinId) return;
        api.post('/meetings/join', { meetingId: joinId })
            .then(() => {
                sessionStorage.setItem('activeMeetingId', joinId);
                setActiveMeetingId(joinId);
            })
            .catch(() => { /* show join tab so user can retry */ });
    }, [searchParams]);

    const handleJoin = (meetingId: string) => {
        sessionStorage.setItem('activeMeetingId', meetingId);
        setActiveMeetingId(meetingId);
    };
    
    const handleEnd = () => {
        sessionStorage.removeItem('activeMeetingId');
        setActiveMeetingId(null);
    };

    if (activeMeetingId) {
        return (
            <div className="h-[calc(100vh-4rem)] p-6">
                <ActiveMeeting meetingId={activeMeetingId} onEnd={handleEnd} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <MeetHeader />
            <MeetTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                {activeTab === 'join' && <JoinMeeting onJoin={handleJoin} />}
                {activeTab === 'schedule' && <ScheduleMeeting />}
                {activeTab === 'upcoming' && <UpcomingMeetings onJoin={handleJoin} />}
            </div>
        </div>
    );
}

const MeetPage = () => (
    <Suspense>
        <MeetPageInner />
    </Suspense>
);

export default MeetPage;
