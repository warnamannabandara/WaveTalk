'use client';

import { useState } from 'react';
import MessageList from '@/components/dashboard/MessageList';
import ChatArea from '@/components/dashboard/ChatArea';

export default function ChatPage() {
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

    return (
        <div className="flex h-full w-full">
            <div className="w-80 h-full border-r border-[#2A3430] shrink-0">
                <MessageList selectedId={selectedConvId} onSelect={setSelectedConvId} />
            </div>
            <div className="flex-1 h-full min-w-0">
                <ChatArea conversationId={selectedConvId} />
            </div>
        </div>
    );
}
