import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"

export default function SignIn() {
    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full mt-6" size="lg">
                    Sign In
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#2E7D66] hover:text-[#256653] font-medium">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    )
}
