import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"

export default function SignUp() {
    return (
        <AuthLayout title="Create Account" subtitle="Get started with WaveTalk">
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full mt-6" size="lg">
                    Create Account
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#2E7D66] hover:text-[#256653] font-medium">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    )
}
