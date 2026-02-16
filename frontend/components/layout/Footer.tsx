import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-[#15231D]">
            <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8 border-t border-white/10">
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-gray-400">
                        &copy; 2026 WaveTalk. All rights reserved.
                    </p>
                </div>
                <div className="flex justify-center space-x-6 md:order-2">
                    <Link href="#" className="text-gray-400 hover:text-gray-300 text-sm">
                        Privacy
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-gray-300 text-sm">
                        Terms
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-gray-300 text-sm">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    )
}
