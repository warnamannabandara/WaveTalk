import { Camera, BrainCircuit, MessageCircleHeart } from "lucide-react"
import { FadeIn } from "../ui/FadeIn"

const steps = [
    {
        name: "1. Join or Start a Meeting",
        description: "Hop into a WaveTalk space in seconds. No downloads required, just standard browser camera permissions.",
        icon: Camera,
    },
    {
        name: "2. Real-time AI processing",
        description: "Our custom model recognizes hand gestures and signs continuously, running natively alongside speech-to-text algorithms.",
        icon: BrainCircuit,
    },
    {
        name: "3. Connect Seamlessly",
        description: "Deaf members sign, and it's spoken aloud. Hearing members speak, and it's transcribed to the screen simultaneously.",
        icon: MessageCircleHeart,
    },
]

export function HowItWorks() {
    return (
        <div className="py-24 sm:py-32 relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <FadeIn className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-[#4ade80]">Effortless Workflow</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Built for natural conversation</p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Zero learning curve. All you need is your device's camera and microphone to start speaking with everyone across languages.
                    </p>
                </FadeIn>
                
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8 text-center relative">
                        
                        {/* Connecting Line background (desktop only) */}
                        <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#4ade80] to-transparent opacity-20 -translate-y-12"></div>
                        
                        {steps.map((step, i) => (
                            <FadeIn key={step.name} delay={i * 0.2} direction="up" className="relative flex flex-col items-center">
                                <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(74,222,128,0.1)] mb-6 ring-8 ring-[#15231D] backdrop-blur-md">
                                    <step.icon className="h-10 w-10 text-[#4ade80]" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold leading-7 text-white mb-3">
                                    {step.name}
                                </h3>
                                <p className="text-base leading-7 text-gray-400 max-w-xs">
                                    {step.description}
                                </p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
