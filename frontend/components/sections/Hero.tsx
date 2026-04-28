"use client";

import { Button } from "../ui/Button"
import Link from "next/link"
import { Sparkles, ArrowRight, Video, Mic, Users, Settings, MoreHorizontal, Phone } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <div className="relative isolate pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
            {/* Background glowing blob */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true"
            >
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2E7D66] to-[#4ade80] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </motion.div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-gray-300 ring-1 ring-white/10 hover:ring-white/20 transition-all flex items-center gap-2 bg-white/5 backdrop-blur-sm cursor-pointer group">
                            <Sparkles className="w-4 h-4 text-[#2E7D66]" />
                            <span>AI-Powered Sign Language Recognition is live.</span>
                            <Link href="/signin" className="font-semibold text-white flex items-center gap-1 ml-1">
                                <span className="absolute inset-0" aria-hidden="true"></span>
                                Try it out <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </Link>
                        </div>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 sm:text-7xl pb-2"
                    >
                        Bridging the Communication Gap with AI
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6 text-lg md:text-xl leading-8 text-gray-400 max-w-2xl mx-auto"
                    >
                        WaveTalk empowers the deaf and hard-of-hearing community with real-time sign language translation, speech-to-text, and inclusive video meetings. Connect without barriers—anywhere, anytime.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 flex items-center justify-center gap-x-6"
                    >
                        <Link href="/signin">
                            <Button size="lg" className="h-12 px-8 flex items-center gap-2 bg-[#2E7D66] hover:bg-[#2E7D66]/90 text-white shadow-[0_0_20px_rgba(46,125,102,0.4)] transition-all">
                                Start Connecting <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="secondary" className="h-12 px-8 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-sm transition-all hidden sm:flex">
                            Watch the Vision
                        </Button>
                    </motion.div>
                </div>
                
                {/* Visual Video UI Mockup */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                    className="mt-16 sm:mt-24"
                >
                    <div className="mx-auto max-w-5xl rounded-2xl bg-[#0B1510] ring-1 ring-white/10 overflow-hidden shadow-2xl relative border border-white/5">
                        
                        {/* Fake Header */}
                        <div className="h-12 bg-gray-100/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center px-4 justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">WaveTalk Secure Meeting</div>
                            <div className="w-16"></div> {/* Spacer balance */}
                        </div>

                        {/* Meeting Grid */}
                        <div className="p-4 grid grid-cols-3 gap-4 h-[400px] sm:h-[500px]">
                            {/* Main Speaker (Signer Placeholder) */}
                            <div className="col-span-3 sm:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl relative overflow-hidden ring-1 ring-white/5 flex items-center justify-center group">
                                <div className="absolute inset-0 bg-[#2E7D66] opacity-10 mix-blend-overlay"></div>
                                
                                {/* Abstract Subject */}
                                <div className="w-48 h-48 rounded-full bg-white/5 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                
                                <div className="text-center z-10 p-6">
                                    <div className="mx-auto w-24 h-24 mb-4 rounded-full border-4 border-[#2E7D66]/30 animate-pulse flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-[#2E7D66]/20 shadow-lg">
                                        <Video className="w-10 h-10 text-[#4ade80]" />
                                    </div>
                                    <span className="bg-black/50 text-[#4ade80] px-3 py-1 rounded-full text-xs border border-[#4ade80]/20 font-medium backdrop-blur-md">
                                        Sign Language Detected
                                    </span>
                                </div>

                                {/* Floating Translation Captions */}
                                <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-center">
                                    <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-lg py-3 px-6 border border-gray-200 dark:border-white/10 shadow-2xl max-w-lg flex items-start gap-4 transform transition-all duration-500 hover:scale-105">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-[#4ade80] animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                                        <p className="text-gray-900 dark:text-white text-lg font-medium leading-relaxed">
                                            "Welcome everyone. Let's discuss the new accessibility features."
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white text-xs px-2 py-1 rounded shadow-sm">Alex (You)</div>
                            </div>

                            {/* Sidebar Participants */}
                            <div className="col-span-3 sm:col-span-1 flex flex-row sm:flex-col gap-4">
                                <div className="flex-1 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-xl relative overflow-hidden ring-1 ring-white/5">
                                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white text-xs px-2 py-1 rounded shadow-sm">Sarah</div>
                                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/50 flex flex-col items-center justify-center text-white"><Mic className="w-3 h-3 text-red-400"/></div>
                                </div>
                                <div className="flex-1 bg-gradient-to-bl from-gray-800 to-gray-700 rounded-xl relative overflow-hidden ring-1 ring-white/5">
                                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white text-xs px-2 py-1 rounded border border-gray-200 dark:border-[#2E7D66]/40 shadow-sm">Maria <span className="text-emerald-600 dark:text-[#4ade80] ml-1 text-[10px]">Speaking...</span></div>
                                    <div className="absolute inset-0 border-2 border-[#2E7D66]/40 rounded-xl pointer-events-none transition-all"></div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="h-20 bg-white/[0.02] border-t border-white/5 flex items-center justify-between px-6">
                            <div className="text-gray-400 text-sm hidden sm:block">10:42 AM | Strategy Sync</div>
                            
                            <div className="flex gap-4">
                                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors hidden sm:flex">
                                    <Users className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors hidden sm:flex">
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors hidden sm:flex">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                    <Phone className="w-5 h-5 rotate-[135deg]" />
                                </button>
                            </div>
                            
                            <div className="w-[150px] hidden sm:block"></div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    )
}
