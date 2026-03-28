"use client";

import { useState } from 'react';
import MeetHeader from '@/components/dashboard/meet/MeetHeader';
import MeetTabs from '@/components/dashboard/meet/MeetTabs';
import JoinMeeting from '@/components/dashboard/meet/JoinMeeting';
import ScheduleMeeting from '@/components/dashboard/meet/ScheduleMeeting';
import UpcomingMeetings from '@/components/dashboard/meet/UpcomingMeetings';
import ActiveMeeting from '@/components/dashboard/meet/ActiveMeeting';

const MeetPage = () => {
    const [activeTab, setActiveTab] = useState('join');
    const [isMeetingActive, setIsMeetingActive] = useState(false);

    const handleJoin = () => setIsMeetingActive(true);
    const handleEnd: () => void = () => setIsMeetingActive(false);

    if (isMeetingActive) {
        return (
            <div className="h-[calc(100vh-4rem)] p-6">
                <ActiveMeeting onEnd={handleEnd} />
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
};

export default MeetPage;
