"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { loginUser } from "@/lib/api"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await loginUser(formData)
            if (response.success) {
                router.push("/dashboard")
            } else {
                setError(response.message)
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="glass max-w-md w-full p-8 rounded-2xl relative z-10 shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                        <LogIn className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-400">
                        Enter your credentials to access your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center animate-shake">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={<Mail className="h-4 w-4" />}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            icon={<Lock className="h-4 w-4" />}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="premium"
                        className="w-full h-12 text-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center">
                        Sign up <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
