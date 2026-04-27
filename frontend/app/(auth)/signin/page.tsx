'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

function SignInForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password, callbackUrl);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Sign in failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-600"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-600"
                        required
                    />
                </div>
                <Button className="w-full mt-6 bg-[#2E7D66] hover:bg-[#256653] text-white shadow-md shadow-emerald-900/20" size="lg" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
}

export default function SignIn() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    );
}
