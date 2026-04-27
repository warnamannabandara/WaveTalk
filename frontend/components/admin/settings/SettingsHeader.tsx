"use client";

import { Sun } from 'lucide-react';

const SettingsHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="text-left">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure your preferences</p>
            </div>
            
        </div>
    );
};

export default SettingsHeader;
