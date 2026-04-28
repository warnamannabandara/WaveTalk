import { Video, Mic, HeartHandshake, FileText, BarChart3, Settings, Zap } from "lucide-react"
import { FadeIn } from "../ui/FadeIn"

const features = [
    {
        name: "Real-time Sign Language Translation",
        description: "Powered by AI, WaveTalk captures sign language through your camera and instantly translates it to text and speech.",
        icon: HeartHandshake,
    },
    {
        name: "Speech-to-Text & Captions",
        description: "Break the barrier. Hear what's signed, or read what's spoken. Real-time captions are available on all your video calls.",
        icon: Mic,
    },
    {
        name: "Inclusive Video Meetings",
        description: "High-quality, accessible video calls built specifically for smooth communication between hearing and deaf individuals.",
        icon: Video,
    },
    {
        name: "Document & Chat Collaboration",
        description: "Easily share files, review materials, and send quick messages in the built-in team text channels.",
        icon: FileText,
    },
    {
        name: "Accessibility Analytics",
        description: "Track transcriptions, review conversation histories, and monitor how your team's accessibility is improving.",
        icon: BarChart3,
    },
    {
        name: "Customizable Experience",
        description: "Adjust text sizes, select preferred themes, blur backgrounds, and set break reminders for long conversations.",
        icon: Settings,
    },
]

export function Features() {
    return (
        <div className="py-24 sm:py-32 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-[#15231D]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2E7D66]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
                <FadeIn className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
                    <h2 className="text-base font-semibold leading-7 text-[#4ade80] flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" /> Next-Generation Accessibility
                    </h2>
                    <p className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Everything you need to communicate without limits
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        We've built a comprehensive suite of tools designed specifically to bridge the gap between deaf, hard-of-hearing, and hearing individuals in both professional and personal environments.
                    </p>
                </FadeIn>

                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <FadeIn key={feature.name} delay={i * 0.1} direction="up" className="relative flex flex-col rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-[#2E7D66]/50 hover:bg-white/[0.07] transition-all duration-300 group overflow-hidden shadow-lg backdrop-blur-sm transform hover:-translate-y-1">
                            {/* Hover background glow */}
                            <div className="absolute -inset-x-4 -inset-y-4 z-0 bg-gradient-to-br from-[#2E7D66]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                            
                            <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2E7D66]/20 border border-[#2E7D66]/30 group-hover:bg-[#2E7D66] group-hover:shadow-[0_0_20px_rgba(46,125,102,0.4)] transition-all duration-300">
                                <feature.icon className="h-7 w-7 text-[#4ade80] group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                            </div>
                            <div className="relative z-10 flex flex-col flex-auto">
                                <h3 className="text-xl font-semibold leading-7 text-white group-hover:text-[#4ade80] transition-colors">
                                    {feature.name}
                                </h3>
                                <p className="mt-4 flex-auto text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                                    {feature.description}
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </div>
    )
}
