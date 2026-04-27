"use client";

import { useState, useRef } from 'react';
import { User, Mail, Phone, Building, Shield, LogOut, Trash2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const AccountTab = () => {
    const { user, logout, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [profileError, setProfileError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setProfileError('Image must be under 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async () => {
        setProfileMsg(''); setProfileError('');
        setProfileLoading(true);
        try {
            const { data } = await api.put('/users/profile', { name, email, avatar: avatarPreview });
            updateUser({ name: data.user.name, email: data.user.email, avatar: data.user.avatar });
            setProfileMsg('Profile updated successfully');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed';
            setProfileError(msg);
        } finally { setProfileLoading(false); }
    };

    const handleChangePassword = async () => {
        setPwMsg(''); setPwError('');
        if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return; }
        setPwLoading(true);
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            setPwMsg('Password updated successfully');
            setCurrentPassword(''); setNewPassword('');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Password update failed';
            setPwError(msg);
        } finally { setPwLoading(false); }
    };

    return (
        <div className="space-y-6 text-left">
            {/* Profile Section */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-6 mb-8">
                    {/* Avatar with upload overlay */}
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-20 h-20 rounded-2xl bg-emerald-900/50 flex items-center justify-center border border-emerald-800 text-3xl font-bold text-emerald-200 overflow-hidden">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                        <p className="text-gray-500">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Click avatar to change photo</p>
                    </div>
                </div>

                {profileMsg && <div className="mb-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800 rounded-lg px-3 py-2">{profileMsg}</div>}
                {profileError && <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{profileError}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" value="Super Admin" disabled
                                className="w-full bg-[#15231D]/50 border border-[#2A3430] rounded-xl py-3 pl-10 pr-4 text-sm text-gray-400 focus:outline-none" />
                        </div>
                    </div>
                </div>

                <button onClick={handleUpdateProfile} disabled={profileLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                    {profileLoading ? 'Saving...' : 'Update Profile'}
                </button>
            </div>

            {/* Change Password */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
                {pwMsg && <div className="mb-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800 rounded-lg px-3 py-2">{pwMsg}</div>}
                {pwError && <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{pwError}</div>}
                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-[#15231D] border border-[#2A3430] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                </div>
                <button onClick={handleChangePassword} disabled={pwLoading}
                    className="w-full bg-[#2A3430] hover:bg-[#3A4440] disabled:opacity-50 text-emerald-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5">
                    <Shield className="w-4 h-4" />
                    {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#1A231F]/50 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-500 mb-6">Danger Zone</h3>
                <div className="space-y-3">
                    <button onClick={logout}
                        className="w-full bg-[#15231D] hover:bg-white/5 text-gray-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-[#2A3430]">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                    <button
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountTab;
