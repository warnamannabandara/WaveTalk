"use client";

import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminHeader = () => {
    const { logout } = useAuth();

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage users, meetings, and system settings</p>
            </div>
            <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E2923] text-gray-300 rounded-lg hover:bg-[#2A3430] hover:text-white transition-all text-sm font-medium"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </header>
    );
};

export default AdminHeader;
