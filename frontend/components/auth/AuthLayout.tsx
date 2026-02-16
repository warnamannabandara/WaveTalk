import Link from "next/link"
import { ArrowLeft, Video } from "lucide-react"

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <div className="w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2E7D66] mb-4">
                            <Video className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                        <p className="text-gray-400 mt-2">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
