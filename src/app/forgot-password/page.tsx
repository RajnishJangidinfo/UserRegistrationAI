"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react"
import { forgotPassword, resetPassword } from "@/lib/api"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await forgotPassword({ email: formData.email })
            if (response.success) {
                setStep(2)
                setSuccess(response.message)
            } else {
                setError(response.message)
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await resetPassword({
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            })
            if (response.success) {
                setSuccess("Password reset successful! Redirecting to login...")
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
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
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
            </div>

            <div className="glass max-w-md w-full p-8 rounded-2xl relative z-10 shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                        <KeyRound className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                        {step === 1 ? "Reset Password" : "Enter OTP"}
                    </h1>
                    <p className="text-sm text-gray-400 text-balance">
                        {step === 1
                            ? "Enter your email address and we'll send you a 6-digit OTP to reset your password."
                            : `We've sent an OTP to ${formData.email}. Please enter it below along with your new password.`
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center mb-6 animate-shake">
                        <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                        {error}
                    </div>
                )}

                {success && step === 2 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded-lg text-sm flex items-center mb-6">
                        <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
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

                        <Button
                            type="submit"
                            variant="premium"
                            className="w-full h-12 text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-gray-300">6-Digit OTP</Label>
                            <Input
                                id="otp"
                                name="otp"
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 text-center tracking-widest text-xl font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                icon={<Lock className="h-4 w-4" />}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                icon={<Lock className="h-4 w-4" />}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="premium"
                            className="w-full h-12 text-lg mt-4"
                            disabled={loading || !!success && success.includes("Redirecting")}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
                        >
                            Change email address
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
