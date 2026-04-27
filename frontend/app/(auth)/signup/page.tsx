'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUp() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            router.push('/dashboard/chat');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Get started with WaveTalk">
            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-600"
                        required
                    />
                </div>
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
                        minLength={6}
                    />
                </div>
                <Button className="w-full mt-6 bg-[#2E7D66] hover:bg-[#256653] text-white shadow-md shadow-emerald-900/20" size="lg" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}
