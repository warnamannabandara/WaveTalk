"use client";

import { User, Mail, Phone, Building, Shield, LogOut, Trash2 } from 'lucide-react';

const AccountTab = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            {/* Profile Section */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-6 mb-8 text-left">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-900/50 flex items-center justify-center border border-emerald-800 text-3xl font-bold text-emerald-200">
                        JD
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">John Doe</h3>
                        <p className="text-gray-500">john.doe@example.com</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                defaultValue="John Doe"
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                defaultValue="john.doe@example.com"
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="tel"
                                defaultValue="+1 234 567 8900"
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                defaultValue="TechCorp Inc."
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                    Update Profile
                </button>
            </div>

            {/* Change Password */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 text-left">
                <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Password</label>
                        <input
                            type="password"
                            className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
                        <input
                            type="password"
                            className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                </div>
                <button className="w-full bg-[#2A3430] hover:bg-[#3A4440] text-emerald-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5">
                    <Shield className="w-4 h-4" />
                    Update Password
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#1A231F]/50 border border-red-500/20 rounded-2xl p-6 text-left">
                <h3 className="text-lg font-bold text-red-500 mb-6">Danger Zone</h3>
                <div className="space-y-3">
                    <button className="w-full bg-[#15231D] hover:bg-white/5 text-gray-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-[#2A3430]">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountTab;
