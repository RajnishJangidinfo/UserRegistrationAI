"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Shield, Calendar, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserData {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUserData(JSON.parse(storedUser))
        } else {
            // If no user is logged in, redirect to login
            router.push("/login")
        }
        setLoading(false)
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (!userData) return null

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Your Profile</h1>
                    <p className="text-zinc-400">Manage your account information</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 glass border-0 flex flex-col items-center py-8 text-white">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 border-4 border-white/10 shadow-xl shadow-indigo-500/20">
                        <span className="text-3xl font-bold uppercase">{userData.username[0]}</span>
                    </div>
                    <CardTitle className="text-xl mb-1">{userData.username}</CardTitle>
                    <CardDescription className="text-indigo-400 font-medium px-3 py-1 bg-indigo-500/10 rounded-full text-xs uppercase tracking-wider">
                        {userData.role}
                    </CardDescription>
                </Card>

                <Card className="md:col-span-2 glass border-0 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Email Address</p>
                                <p className="text-md font-medium text-zinc-100">{userData.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Account Role</p>
                                <p className="text-md font-medium text-zinc-100">{userData.role}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Joined Date</p>
                                <p className="text-md font-medium text-zinc-100">
                                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
