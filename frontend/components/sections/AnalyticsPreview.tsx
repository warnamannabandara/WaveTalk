import { BarChart3, Activity, Clock, TrendingUp } from "lucide-react"
import { FadeIn } from "../ui/FadeIn"

export function AnalyticsPreview() {
    return (
        <div className="py-24 sm:py-32 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-center">
                    
                    <FadeIn direction="right">
                        <h2 className="text-base font-semibold leading-7 text-[#4ade80] flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" /> Accessibility Insights
                        </h2>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Track the impact of inclusion
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-400">
                            Our rich analytics dashboard provides detailed metrics about meeting participation, transcription coverage, and AI translation accuracy. Use this data to foster an environment where everyone can be heard.
                        </p>
                        
                        <div className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-300">
                            {[
                                {
                                    icon: Activity,
                                    title: "Live Health Monitoring.",
                                    desc: "Monitor transcript generation health, connection strength, and CPU overhead in real time during video sessions."
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Inclusivity Scores.",
                                    desc: "Quantify how effectively teams use live captioning and sign language modules across the organization over time."
                                },
                                {
                                    icon: Clock,
                                    title: "History & Transcripts.",
                                    desc: "Revisit meeting minutes generated dynamically by our STT and SLT systems, complete with timestamps and action items."
                                }
                            ].map((item, idx) => (
                                <FadeIn key={idx} delay={idx * 0.15} direction="up" className="flex gap-x-3">
                                    <item.icon className="mt-1 h-5 w-5 flex-none text-[#4ade80]" aria-hidden="true" />
                                    <span><strong className="font-semibold text-white">{item.title}</strong> {item.desc}</span>
                                </FadeIn>
                            ))}
                        </div>
                    </FadeIn>
                    
                    <FadeIn direction="left" className="mt-16 sm:mt-24 lg:mt-0">
                        <div className="relative rounded-2xl bg-[#0B1510] ring-1 ring-white/10 p-2 sm:p-4 shadow-2xl overflow-hidden backdrop-blur-md border border-white/5 group">
                            
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D66]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                            <div className="rounded-xl ring-1 ring-white/5 bg-gray-900 border border-white/5 relative z-10 grid grid-cols-2 gap-4 p-4">
                                <div className="col-span-2 bg-gray-800 rounded-lg p-4 ring-1 ring-white/5">
                                    <h4 className="text-gray-400 text-sm font-medium mb-4">Live Translation Accuracy</h4>
                                    <div className="w-full h-32 flex items-end gap-2 px-2">
                                        {[40, 60, 45, 80, 60, 95, 85].map((height, i) => (
                                            <div key={i} className="flex-1 bg-gradient-to-t from-[#2E7D66] to-[#4ade80] rounded-t-md opacity-80 animate-pulse" style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-4 ring-1 ring-white/5 flex flex-col justify-center">
                                    <h4 className="text-gray-400 text-sm font-medium">Captions Used</h4>
                                    <span className="text-3xl font-bold text-white mt-2">12,450<span className="text-sm text-[#4ade80] ml-2">min</span></span>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-4 ring-1 ring-white/5 flex flex-col justify-center">
                                    <h4 className="text-gray-400 text-sm font-medium">Diversity Score</h4>
                                    <span className="text-3xl font-bold text-white mt-2">9.8<span className="text-sm text-gray-500 ml-2">/ 10</span></span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                    
                </div>
            </div>
        </div>
    )
}
