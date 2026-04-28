"use client";

import { Sun } from 'lucide-react';

const SettingsHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-gray-400 text-sm">Configure your preferences</p>
            </div>
            
        </div>
    );
};

export default SettingsHeader;
