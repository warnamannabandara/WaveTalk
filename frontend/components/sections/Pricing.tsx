import { Check } from "lucide-react"
import { Button } from "../ui/Button"
import { FadeIn } from "../ui/FadeIn"

const tiers = [
    {
        name: "Basic",
        id: "tier-basic",
        href: "/signup",
        price: "$0",
        description: "Everything you need to try out WaveTalk.",
        features: ["1-on-1 Video Meetings", "Real-time AI Sign Language Translation", "Basic Speech-to-Text", "Community Chat"],
        featured: false,
    },
    {
        name: "Pro",
        id: "tier-pro",
        href: "/signup",
        price: "$29",
        description: "Perfect for professionals and small teams.",
        features: ["Unlimited Group Meetings", "Advanced Vocabulary Translation", "Meeting Recordings & Transcripts", "Break Reminders & Custom Backgrounds", "Priority Support"],
        featured: true,
    },
    {
        name: "Enterprise",
        id: "tier-enterprise",
        href: "/contact",
        price: "Custom",
        description: "Dedicated resources for large organizations.",
        features: ["Custom AI Model Training", "SSO & Advanced Security", "Dedicated Account Manager", "Accessibility Analytics Dashboard", "White-labeling Options"],
        featured: false,
    }
]

export function Pricing() {
    return (
        <div className="py-24 sm:py-32 relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <FadeIn className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-[#4ade80]">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Universal access, priced fairly
                    </p>
                </FadeIn>
                <FadeIn delay={0.2} className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-400">
                    Whether you are an individual wanting to connect with a loved one or a company aiming to be fully inclusive.
                </FadeIn>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
                    {tiers.map((tier, i) => (
                        <FadeIn
                            key={tier.id}
                            delay={i * 0.2}
                            direction="up"
                            className={`rounded-3xl p-8 ring-1 ring-white/10 ${
                                tier.featured ? "bg-white/10 shadow-[0_0_30px_rgba(46,125,102,0.3)] ring-2 ring-[#4ade80]" : "bg-white/5"
                            } backdrop-blur-sm transition-transform hover:-translate-y-2`}
                        >
                            <h3 id={tier.id} className={`text-lg font-semibold leading-8 ${tier.featured ? "text-[#4ade80]" : "text-white"}`}>
                                {tier.name}
                            </h3>
                            <p className="mt-4 text-sm leading-6 text-gray-400">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                                {tier.price !== "Custom" && <span className="text-sm font-semibold leading-6 text-gray-400">/month</span>}
                            </p>
                            <a
                                href={tier.href}
                                className={`mt-6 block rounded-full px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                    tier.featured
                                        ? "bg-[#4ade80] text-gray-900 hover:bg-[#4ade80]/90 focus-visible:outline-[#4ade80]"
                                        : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                                } transition-colors`}
                            >
                                Get started today
                            </a>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-400">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check className={`h-6 w-5 flex-none ${tier.featured ? "text-[#4ade80]" : "text-[#2E7D66]"}`} aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </div>
    )
}
