"use client";

import { Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

const PreferencesTab = () => {
    const { theme } = useTheme();

    return (
        <div className="space-y-6 text-left">
            {/* Theme */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Theme</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Currently: <span className="font-medium text-emerald-400 capitalize">{theme}</span> mode
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Bell className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Push Notifications', desc: 'Receive notifications on this device', defaultChecked: true },
                        { label: 'Email Notifications', desc: 'Receive notifications via email', defaultChecked: true },
                        { label: 'Sound', desc: 'Play sound for notifications', defaultChecked: true },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                            <div className="text-left">
                                <h4 className="text-sm font-medium text-white">{item.label}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                                <div className="w-11 h-6 bg-[#2A3430] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreferencesTab;
