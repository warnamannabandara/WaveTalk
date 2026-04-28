import { Button } from "../ui/Button"
import Link from "next/link"
import { Users, Globe } from "lucide-react"
import { FadeIn } from "../ui/FadeIn"

export function CTA() {
    return (
        <div className="relative isolate px-6 py-24 sm:px-6 sm:py-32 lg:px-8 overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden blur-3xl opacity-30" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2E7D66] to-[#4ade80]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>
            
            <FadeIn direction="up" className="mx-auto max-w-5xl rounded-[3rem] bg-white/5 border border-white/10 px-6 py-24 text-center sm:px-16 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute -inset-px bg-gradient-to-b from-[#2E7D66]/20 to-[#2E7D66]/5 rounded-[3rem] -z-10 pointer-events-none group-hover:from-[#2E7D66]/30 transition-colors duration-700"></div>
                
                <div className="mb-8 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="relative flex">
                        <Users className="w-12 h-12 text-[#2E7D66] -mr-4 drop-shadow-md" />
                        <Globe className="w-12 h-12 text-[#4ade80] drop-shadow-md z-10" />
                    </div>
                </div>
                
                <h2 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    Ready for a More Inclusive World?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-gray-300">
                    Join the people and teams communicating seamlessly with WaveTalk's real-time AI sign language translation. No learning curve, just seamless human connection.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/signin">
                        <Button size="lg" className="h-14 px-8 text-lg bg-white text-[#15231D] hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 font-bold">
                            Join the Movement Space
                        </Button>
                    </Link>
                    <Link href="/dashboard/meet" className="hidden sm:block">
                        <Button size="lg" variant="secondary" className="h-14 px-8 text-lg bg-white/5 border-white/10 hover:bg-white/10 text-white">
                            Try as Guest
                        </Button>
                    </Link>
                </div>
            </FadeIn>
        </div>
    )
}
