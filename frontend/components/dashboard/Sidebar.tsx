"use client";



import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Video, Calendar, FileText, BarChart2, Settings, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

const Sidebar = () => {
    const { data: session } = useSession();

    const navItems = [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
        { icon: Video, label: 'Meet', href: '/dashboard/meet' },
        { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
        { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
        { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];

    const pathname = usePathname();

    return (
        <div className="w-64 h-full bg-[#1A231F] border-r border-[#2A3430] flex flex-col justify-between p-4">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Video className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">WaveTalk</h1>
                </div>

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
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User */}
            <div className="pt-4 border-t border-[#2A3430]">
                <button className="flex items-center gap-3 px-2 w-full hover:bg-white/5 p-2 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-800">
                        <span className="text-xs font-medium text-emerald-200">
                            {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate group-hover:text-emerald-300 transition-colors">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email || 'Loading...'}
                        </p>
                    </div>
                    {/* <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" /> */}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
