import { Button } from "../ui/Button"

export function CTA() {
    return (
        <div className="relative isolate px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-5xl rounded-3xl bg-[#2E7D66]/20 bg-gradient-to-b from-[#2E7D66] to-[#2E7D66]/80 px-6 py-24 text-center sm:px-16 md:bg-none ring-1 ring-white/10">
                <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-4xl">
                    Ready to Transform Your Team's Collaboration?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
                    Join thousands of teams already using WaveTalk.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button size="lg" className="bg-white text-[#15231D] hover:bg-white/90">
                        Get Started Now
                    </Button>
                </div>
            </div>
        </div>
    )
}
