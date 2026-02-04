"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users as UsersIcon, Mail, Calendar, Shield, AlertCircle } from "lucide-react"
import { getUsers, User } from "@/lib/api"

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true)
            const response = await getUsers()
            if (response.success) {
                setUsers(response.data || [])
            } else {
                setError(response.message)
            }
            setLoading(false)
        }
        fetchUsers()
    }, [])

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Users</h2>
                    <p className="text-zinc-400">Manage your fleet personnel.</p>
                </div>
            </div>

            {loading && (
                <div className="text-center text-zinc-400 py-12">
                    Loading users...
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}

            {!loading && !error && users.length === 0 && (
                <div className="text-center text-zinc-400 py-12">
                    No users found. Register a new user to get started!
                </div>
            )}

            {!loading && !error && users.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                        <Card key={user.id} className="glass border-0 hover:bg-white/10 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-medium text-white">
                                        {user.username}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-zinc-400">
                                        {user.role}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center text-sm text-zinc-400">
                                    <Mail className="mr-2 h-4 w-4 text-zinc-500" />
                                    {user.email}
                                </div>
                                <div className="flex items-center text-sm text-zinc-400">
                                    <Calendar className="mr-2 h-4 w-4 text-zinc-500" />
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-zinc-400">
                                    <Shield className="mr-2 h-4 w-4 text-zinc-500" />
                                    ID: {user.id}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
