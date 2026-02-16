"use client";

import InMeetingHeader from './InMeetingHeader';
import ParticipantGrid from './ParticipantGrid';
import MeetingControls from './MeetingControls';

interface ActiveMeetingProps {
    onEnd: () => void;
}

const ActiveMeeting = ({ onEnd }: ActiveMeetingProps) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
            <InMeetingHeader />
            <ParticipantGrid />
            <MeetingControls onEnd={onEnd} />
        </div>
    );
};

export default ActiveMeeting;
