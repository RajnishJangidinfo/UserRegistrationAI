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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]" />
            </div>

            <Card className="max-w-md w-full glass border-0 text-white relative z-10 animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                        <LogIn className="w-6 h-6 text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-100 p-3 rounded-lg flex items-center gap-2 text-sm animate-shake">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 glass border-white/10 focus:border-indigo-500/50 bg-white/5"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 glass border-white/10 focus:border-indigo-500/50 bg-white/5"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" variant="premium" className="w-full h-11" disabled={loading}>
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

                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-white font-medium hover:underline inline-flex items-center">
                            Sign up <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
