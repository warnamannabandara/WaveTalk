"use client";

import { Sun } from 'lucide-react';

const AnalyticsHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
                <p className="text-gray-400 text-sm">View your performance metrics</p>
            </div>
            
        </div>
    );
};

export default AnalyticsHeader;
