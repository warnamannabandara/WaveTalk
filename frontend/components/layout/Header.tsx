'use client';

import Link from "next/link"
import { Video, Sparkles, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/Button"
import { ThemeToggle } from "../ui/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
    const { user, loading, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dashboardHref = user?.role === 'admin' ? '/admin/overview' : '/dashboard/chat';

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
            <header className="pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-[#15231D]/50 px-4 sm:px-6 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#2E7D66] to-[#4ade80] shadow-[0_0_15px_rgba(46,125,102,0.5)] group-hover:scale-105 transition-transform">
                            <Video className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">WaveTalk</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                        <Link href="#features" className="hover:text-[#4ade80] transition-colors">Features</Link>
                        <Link href="#analytics" className="hover:text-[#4ade80] transition-colors">Analytics</Link>
                        <Link href="#pricing" className="hover:text-[#4ade80] transition-colors">Pricing</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <ThemeToggle />

                    {!loading && user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(prev => !prev)}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 px-3 h-9 transition-all"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-[#2E7D66] flex items-center justify-center text-xs font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden sm:block text-sm font-medium text-white max-w-25 truncate">{user.name}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} />
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#15231D] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href={dashboardHref}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { setOpen(false); logout(); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : !loading && (
                        <>
                            <Link href="/signin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
                                Sign In
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all font-medium flex items-center gap-2 h-9 px-4 group">
                                    Get Started
                                    <Sparkles className="w-3.5 h-3.5 text-[#4ade80] group-hover:rotate-12 transition-transform" />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </header>
        </div>
    )
}
