import { Search, Filter, BellOff } from 'lucide-react';

const MessageList = () => {
    const chats = [
        {
            id: 1,
            name: "Project Alpha Team",
            message: "Great work on the presentation!",
            time: "2m ago",
            unread: 3,
            pinned: true,
            active: true
        },
        {
            id: 2,
            name: "Marketing Team",
            message: "Meeting scheduled for 3 PM",
            time: "15m ago",
            unread: 0,
            active: false
        },
        {
            id: 3,
            name: "Sarah Johnson",
            message: "Can you review the document?",
            time: "1h ago",
            unread: 1,
            active: false
        },
        {
            id: 4,
            name: "Development Squad",
            message: "Bug fixes deployed",
            time: "2h ago",
            muted: true,
            active: false
        },
        {
            id: 5,
            name: "Design Review",
            message: "New mockups attached",
            time: "3h ago",
            unread: 5,
            active: false
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#1A231F]">
            {/* Header */}
            <div className="p-4 border-b border-[#2A3430]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Invite</button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-[#151b18] text-sm text-white pl-10 pr-4 py-2.5 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-600"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-1.5 rounded-md transition-colors">All</button>
                    <button className="px-3 bg-[#151b18] hover:bg-[#2A3430] text-gray-400 border border-[#2A3430] rounded-md transition-colors">
                        <Filter className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`p-4 border-b border-[#2A3430] hover:bg-white/5 cursor-pointer transition-colors group ${chat.active ? 'bg-emerald-900/10 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-sm font-semibold truncate ${chat.pinned ? 'text-white flex items-center gap-1.5' : 'text-gray-200'}`}>
                                {chat.pinned && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                {chat.name}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-medium">{chat.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{chat.message}</p>
                            <div className="flex items-center gap-2">
                                {chat.muted && <BellOff className="w-3 h-3 text-gray-600" />}
                                {(chat.unread || 0) > 0 && (
                                    <span className="w-4 h-4 flex items-center justify-center bg-emerald-600 text-[10px] font-bold text-white rounded-full">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-[#2A3430]">
                <button className="w-full py-2 border border-dashed border-[#2A3430] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2">
                    <span>+</span> New Chat
                </button>
            </div>
        </div>
    );
};

export default MessageList;
