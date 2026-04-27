"use client";

import Link from "next/link"
import { ArrowLeft, Video } from "lucide-react"
import { motion } from "framer-motion"

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#15231D] overflow-hidden selection:bg-emerald-500/30">
            {/* Ambient Backgrounds */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Blob */}
                <div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-gradient-to-br from-[#2E7D66]/20 to-[#4ade80]/10 blur-[120px] mix-blend-normal"
                    aria-hidden="true"
                />
                {/* Bottom Blob */}
                <div
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#2E7D66]/20 to-transparent blur-[120px] mix-blend-normal"
                    aria-hidden="true"
                />
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-8 left-8 z-20"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-full hover:bg-white/5"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
            </motion.div>

            <div className="w-full max-w-[420px] z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/" className="flex items-center justify-center gap-3 mb-10 group transition-all duration-300 hover:opacity-90">
                        <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.3)] ring-1 ring-white/10 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(52,211,153,0.4)] transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                            <Video className="text-white w-6 h-6 relative z-10 drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                            WaveTalk
                        </h1>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
                >
                    {/* Top glass glare effect */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />

                    <div className="flex flex-col text-left mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-sm sm:text-base text-gray-400 mt-2.5 font-medium">{subtitle}</p>
                    </div>
                    {children}
                </motion.div>
            </div>
        </div>
    )
}
