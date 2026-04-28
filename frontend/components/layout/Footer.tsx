import Link from "next/link"
import { Video, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-[#15231D] relative overflow-hidden backdrop-blur-lg">
            <div className="absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl opacity-20 pointer-events-none">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#2E7D66] to-[#4ade80]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 border-t border-white/5">
                <div className="lg:flex lg:items-center lg:justify-between">
                    <div>
                        <Link href="/" className="flex items-center gap-2 group mb-4 lg:mb-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2E7D66] to-[#4ade80] shadow-[0_0_15px_rgba(46,125,102,0.4)] group-hover:scale-105 transition-transform">
                                <Video className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">WaveTalk</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                            Empowering the deaf and hard-of-hearing community with real-time AI sign language translation globally.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-0 xl:gap-8">
                        <div>
                            <h3 className="text-sm font-semibold leading-6 text-white text-left">Platform</h3>
                            <ul role="list" className="mt-4 space-y-4 text-left">
                                <li><Link href="/signin" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link href="#features" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/signup" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold leading-6 text-white text-left">Company</h3>
                            <ul role="list" className="mt-4 space-y-4 text-left">
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">About</Link></li>
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="text-sm font-semibold leading-6 text-white text-left">Legal</h3>
                            <ul role="list" className="mt-4 space-y-4 text-left">
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Accessibility</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-white/10 pt-8 sm:flex sm:items-center sm:justify-between">
                    <div className="flex space-x-6 justify-center sm:justify-start">
                        <Link href="#" className="text-gray-400 hover:text-[#4ade80] transition-colors"><span className="sr-only">Twitter</span><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">GitHub</span><Github className="h-5 w-5" /></Link>
                        <Link href="#" className="text-gray-400 hover:text-[#4ade80] transition-colors"><span className="sr-only">LinkedIn</span><Linkedin className="h-5 w-5" /></Link>
                    </div>
                    <p className="mt-8 text-center text-xs leading-5 text-gray-400 sm:mt-0">
                        &copy; {new Date().getFullYear()} WaveTalk. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
