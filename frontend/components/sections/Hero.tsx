import { Button } from "../ui/Button"

export function Hero() {
    return (
        <div className="relative isolate pt-32 pb-24 sm:pt-40 sm:pb-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        All-in-One Collaboration Platform
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-white/70">
                        Meet, chat, manage tasks, and track analytics all in one place. Streamline your team's workflow with WaveTalk.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button size="lg">Start Free Trial</Button>
                        <Button size="lg" variant="secondary">
                            Watch Demo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
