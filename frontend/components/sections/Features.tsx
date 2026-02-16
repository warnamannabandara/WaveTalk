import { Video, MessageSquare, Calendar, FileText, BarChart3, Settings } from "lucide-react"

const features = [
    {
        name: "Video Meetings",
        description: "High-quality video calls with screen sharing, recording, and real-time collaboration",
        icon: Video,
    },
    {
        name: "Team Chat",
        description: "Group chats, direct messages, and organized channels for seamless communication",
        icon: MessageSquare,
    },
    {
        name: "Smart Calendar",
        description: "Schedule meetings, manage tasks, and track deadlines all in one place",
        icon: Calendar,
    },
    {
        name: "Document Management",
        description: "Store, share, and collaborate on documents with version control",
        icon: FileText,
    },
    {
        name: "Analytics Dashboard",
        description: "Track team performance, meeting attendance, and project progress",
        icon: BarChart3,
    },
    {
        name: "Customizable Settings",
        description: "Personalize your workspace with themes, languages, and preferences",
        icon: Settings,
    },
]

export function Features() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.name} className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
                                <feature.icon className="h-8 w-8 text-[#2E7D66]" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-semibold leading-7 text-white">
                                    {feature.name}
                                </h3>
                                <p className="mt-4 flex-auto text-base leading-7 text-gray-300">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
