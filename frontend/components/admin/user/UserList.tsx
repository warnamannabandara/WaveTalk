"use client";

import { Search, UserPlus } from 'lucide-react';
import UserRow from './UserRow';

const userData = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', meetings: 45, lastActive: '2 mins ago', status: 'Active' as const },
    { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'User', meetings: 38, lastActive: '5 mins ago', status: 'Active' as const },
    { name: 'Mike Chen', email: 'mike@example.com', role: 'User', meetings: 52, lastActive: '1 hour ago', status: 'Active' as const },
    { name: 'Emily Davis', email: 'emily@example.com', role: 'User', meetings: 23, lastActive: '2 days ago', status: 'Inactive' as const },
    { name: 'David Wilson', email: 'david@example.com', role: 'User', meetings: 41, lastActive: '10 mins ago', status: 'Active' as const },
];

const UserList = () => {
    return (
        <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-[#2A3430] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-[#0D1210] border border-[#2A3430] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all text-sm font-medium">
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {userData.map((user, index) => (
                    <UserRow key={index} {...user} />
                ))}
            </div>
        </div>
    );
};

export default UserList;
