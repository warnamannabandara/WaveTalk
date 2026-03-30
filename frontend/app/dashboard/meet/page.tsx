"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import MeetHeader from '@/components/dashboard/meet/MeetHeader';
import JoinMeeting from '@/components/dashboard/meet/JoinMeeting';
import ScheduleMeeting from '@/components/dashboard/meet/ScheduleMeeting';
import UpcomingMeetings from '@/components/dashboard/meet/UpcomingMeetings';
import ActionGrid from '@/components/dashboard/meet/ActionGrid';
import HomeClockWidget from '@/components/dashboard/meet/HomeClockWidget';
import ActionModal from '@/components/dashboard/meet/ActionModal';

const MeetPage = () => {
    const router = useRouter();
    const [modalState, setModalState] = useState<'join' | 'schedule' | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const generateMeetingId = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };

    const handleStartInstantMeeting = async () => {
        try {
            setIsStarting(true);
            const id = generateMeetingId();

            await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingId: id,
                    title: 'Instant Meeting'
                }),
            });

            router.push(`/meeting/${id}?create=true`);
        } catch (error) {
            console.error('Failed to create meeting', error);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-10 h-full flex flex-col">
            <MeetHeader />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left Column: Actions */}
                <div className="lg:col-span-3 flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-700">
                    <ActionGrid
                        onNewMeeting={handleStartInstantMeeting}
                        onJoin={() => setModalState('join')}
                        onSchedule={() => setModalState('schedule')}
                        onShareScreen={() => { }} // TODO: Implement share screen
                        isStarting={isStarting}
                    />
                </div>

                {/* Right Column: Clock & Upcoming */}
                <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <HomeClockWidget />
                    <UpcomingMeetings onJoin={() => { }} />
                </div>
            </div>

            {/* Modals */}
            <ActionModal
                isOpen={modalState === 'join'}
                onClose={() => setModalState(null)}
                title="Join a Meeting"
            >
                <JoinMeeting onClose={() => setModalState(null)} />
            </ActionModal>

            <ActionModal
                isOpen={modalState === 'schedule'}
                onClose={() => setModalState(null)}
                title="Schedule Meeting"
            >
                <ScheduleMeeting onClose={() => setModalState(null)} />
            </ActionModal>
        </div>
    );
};

export default MeetPage;

