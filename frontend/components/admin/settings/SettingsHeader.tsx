"use client";

import { Sun } from 'lucide-react';

const SettingsHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="text-left">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure your preferences</p>
            </div>
            <button className="p-2 rounded-lg bg-[#1A231F] border border-[#2A3430] text-gray-400 hover:text-white transition-colors">
                <Sun className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SettingsHeader;
