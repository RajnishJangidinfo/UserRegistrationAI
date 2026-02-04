"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { registerUser } from "@/lib/api"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name) newErrors.name = "Username is required"
        if (!formData.email) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

        if (!formData.password) newErrors.password = "Password is required"
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
        setServerError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        setServerError("")

        const response = await registerUser({
            username: formData.name, // Mapping name to username for API
            email: formData.email,
            password: formData.password
        })

        setLoading(false)

        if (response.success) {
            setSuccess(true)
        } else {
            setServerError(response.message)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
                <div className="glass max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
                    <p className="text-gray-300 mb-8">
                        Welcome aboard, {formData.name}. Your journey to the infinite begins now.
                    </p>
                    <Link href="/users" className="w-full">
                        <Button
                            className="w-full"
                            variant="premium"
                        >
                            Continue to Users <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="glass max-w-md w-full p-8 rounded-2xl relative z-10 shadow-2xl ring-1 ring-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                        Join the Universe
                    </h1>
                    <p className="text-sm text-gray-400">
                        Create your account to start exploring.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {serverError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {serverError}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            icon={<User className="h-4 w-4" />}
                            className={cn("bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20", errors.name && "border-red-500 focus:border-red-500")}
                        />
                        {errors.name && <p className="text-xs text-red-400 flex items-center mt-1"><AlertCircle className="h-3 w-3 mr-1" /> {errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            icon={<Mail className="h-4 w-4" />}
                            className={cn("bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20", errors.email && "border-red-500 focus:border-red-500")}
                        />
                        {errors.email && <p className="text-xs text-red-400 flex items-center mt-1"><AlertCircle className="h-3 w-3 mr-1" /> {errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            icon={<Lock className="h-4 w-4" />}
                            className={cn("bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20", errors.password && "border-red-500 focus:border-red-500")}
                        />
                        {errors.password && <p className="text-xs text-red-400 flex items-center mt-1"><AlertCircle className="h-3 w-3 mr-1" /> {errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            icon={<Lock className="h-4 w-4" />}
                            className={cn("bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20", errors.confirmPassword && "border-red-500 focus:border-red-500")}
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-400 flex items-center mt-1"><AlertCircle className="h-3 w-3 mr-1" /> {errors.confirmPassword}</p>}
                    </div>

                    <Button
                        type="submit"
                        variant="premium"
                        className="w-full h-12 text-lg"
                        isLoading={loading}
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400">Already have an account? </span>
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
