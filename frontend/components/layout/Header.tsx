import Link from "next/link"
import { Video } from "lucide-react"
import { Button } from "../ui/Button"

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#15231D]/80 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2E7D66]">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">WaveTalk</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/signin" className="text-sm font-medium text-white/70 hover:text-white">
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
