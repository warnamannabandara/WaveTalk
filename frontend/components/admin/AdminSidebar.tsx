"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Video } from 'lucide-react';

const AdminSidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', href: '/admin/overview' },
        { icon: Users, label: 'Users', href: '/admin/user' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ];

    const pathname = usePathname();

    return (
        <div className="w-64 h-full bg-[#111815] border-r border-[#1E2923] flex flex-col justify-between p-4">
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
            <div className="pt-4 border-t border-[#1E2923]">
                <div className="flex items-center gap-3 px-2 w-full p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-800">
                        <span className="text-xs font-medium text-emerald-200">JD</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">John Doe</p>
                        <p className="text-xs text-gray-500 truncate">john@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
