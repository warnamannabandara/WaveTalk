import MessageList from '@/components/dashboard/MessageList';
import ChatArea from '@/components/dashboard/ChatArea';

export default function ChatPage() {
    return (
        <div className="flex h-full w-full">
            {/* Middle Column: Message List */}
            <div className="w-80 h-full border-r border-[#2A3430] flex-shrink-0">
                <MessageList />
            </div>

            {/* Right Column: Chat Area */}
            <div className="flex-1 h-full min-w-0">
                <ChatArea />
            </div>
        </div>
    );
}
