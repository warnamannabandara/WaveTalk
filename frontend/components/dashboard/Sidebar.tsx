'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Calendar, FileText, BarChart2, Settings, Hand, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
    { icon: Home, label: 'Chat', href: '/dashboard/chat' },
    { icon: Video, label: 'Meet', href: '/dashboard/meet' },
    { icon: Hand, label: 'Sign Language', href: '/dashboard/sign-language' },
    { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
    { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'WV';

    return (
        <div className="w-64 h-full bg-[#1A231F] border-r border-[#2A3430] flex flex-col justify-between p-4">
            <div>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 px-2 mb-8 mt-2 group transition-opacity hover:opacity-90">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-1 ring-white/10 group-hover:scale-105 transition-all">
                        <Video className="text-white w-4 h-4" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">WaveTalk</h1>
                </Link>

                {/* Nav */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-emerald-600/10 text-emerald-400'
                                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                                {item.label}
                                {item.label === 'Sign Language' && (
                                    <span className="ml-auto text-[10px] font-semibold bg-emerald-700/50 text-emerald-300 px-1.5 py-0.5 rounded">AI</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="pt-4 border-t border-[#2A3430] space-y-3">
                {/* Theme toggle row */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-gray-500">Theme</span>
                    <ThemeToggle />
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 px-2 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-800 shrink-0">
                        <span className="text-xs font-medium text-emerald-200">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
