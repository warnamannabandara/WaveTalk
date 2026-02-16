"use client";

import { Info, Code, ShieldCheck, Heart } from 'lucide-react';

const AboutTab = () => {
    return (
        <div className="space-y-6 max-w-4xl text-left">
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                    <Info className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">WaveTalk</h3>
                <p className="text-gray-500 text-sm mb-8">Version 1.0.4 (Stable Release)</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                            <Code className="w-4 h-4 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Open Source</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Built with the latest technologies and community-driven features.</p>
                    </div>
                    <div className="p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Secure</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">End-to-end encryption for all your meetings and documents.</p>
                    </div>
                    <div className="p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Made with Love</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Crafted with attention to detail for the best user experience.</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-left">Latest Updates</h4>
                <div className="space-y-4">
                    {[
                        { version: '1.0.4', date: 'Feb 15, 2026', changes: ['Performance improvements in video calls', 'Bug fixes in chat area'] },
                        { version: '1.0.3', date: 'Jan 28, 2026', changes: ['Added dark mode support', 'New settings dashboard layout'] },
                    ].map((update) => (
                        <div key={update.version} className="flex gap-4 text-left">
                            <div className="w-2 bg-emerald-600 rounded-full" />
                            <div>
                                <h5 className="text-sm font-bold text-white">Version {update.version} <span className="text-gray-500 font-medium ml-2">{update.date}</span></h5>
                                <ul className="mt-2 space-y-1">
                                    {update.changes.map((change, i) => (
                                        <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-900" />
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutTab;
