"use client";

import { Monitor, Globe, Bell, ChevronDown } from 'lucide-react';

const PreferencesTab = () => {
    return (
        <div className="space-y-6 max-w-4xl text-left">
            {/* Appearance */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Monitor className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Appearance</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Theme</label>
                        <div className="relative group">
                            <select className="w-full appearance-none bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                                <option>Dark</option>
                                <option>Light</option>
                                <option>System</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size</label>
                        <div className="relative group">
                            <select className="w-full appearance-none bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                                <option>Small</option>
                                <option>Medium</option>
                                <option>Large</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Language & Region */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Language & Region</h3>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</label>
                    <div className="relative group">
                        <select className="w-full appearance-none bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-emerald-400 transition-colors" />
                    </div>
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
                            <div>
                                <h4 className="text-sm font-medium text-white">{item.label}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                                <div className="w-11 h-6 bg-[#2A3430] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreferencesTab;
