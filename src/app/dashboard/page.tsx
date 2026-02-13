"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
<<<<<<< HEAD
import { Activity, Users, CreditCard, DollarSign } from "lucide-react"
import dynamic from "next/dynamic"

const OverviewChart = dynamic(() => import("@/components/dashboard/overview-chart").then(mod => mod.OverviewChart), { ssr: false })

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Revenue",
            value: "$45,231.89",
            change: "+20.1% from last month",
            icon: DollarSign,
            color: "text-green-500",
        },
        {
            title: "Subscriptions",
            value: "+2350",
            change: "+180.1% from last month",
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Sales",
            value: "+12,234",
            change: "+19% from last month",
            icon: CreditCard,
            color: "text-orange-500",
        },
        {
            title: "Active Now",
            value: "+573",
            change: "+201 since last hour",
            icon: Activity,
            color: "text-purple-500",
        },
    ]
=======
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Activity,
    ArrowLeft,
    ArrowUp,
    ArrowDown
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { getWeeklyAnalytics, getMonthlyAnalytics, getAnnualAnalytics, OrderStatistics } from "@/lib/api"
import { ProtectedRoute } from "@/components/ProtectedRoute"

type TimePeriod = "weekly" | "monthly" | "annual"

export default function DashboardPage() {
    return (
        <ProtectedRoute requiredRole={["Admin", "SuperAdmin"]}>
            <DashboardContent />
        </ProtectedRoute>
    )
}

function DashboardContent() {
    const router = useRouter()
    const [period, setPeriod] = useState<TimePeriod>("weekly")
    const [stats, setStats] = useState<OrderStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchAnalytics = async (selectedPeriod: TimePeriod) => {
        setLoading(true)
        setError("")

        let response
        switch (selectedPeriod) {
            case "weekly":
                response = await getWeeklyAnalytics()
                break
            case "monthly":
                response = await getMonthlyAnalytics()
                break
            case "annual":
                response = await getAnnualAnalytics()
                break
        }

        if (response.success) {
            setStats(response.data)
        } else {
            setError(response.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAnalytics(period)
    }, [period])

    const getPeriodText = () => {
        switch (period) {
            case "weekly": return "Last 7 Days"
            case "monthly": return "Last 30 Days"
            case "annual": return "Last 12 Months"
        }
    }
>>>>>>> eafdb5d (Fix API authentication and improve RBAC UI controls)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-purple-500/15 blur-[150px] animate-pulse" />
                <div className="absolute top-[50%] -right-[15%] w-[50%] h-[50%] rounded-full bg-indigo-500/15 blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="relative z-10 p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 w-fit group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 drop-shadow-lg">
                        Analytics Dashboard
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-300 font-medium">
                        Track your business performance and growth
                    </p>
                </div>

                {/* Time Period Selector */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={period === "weekly" ? "default" : "outline"}
                        onClick={() => setPeriod("weekly")}
                        className={period === "weekly"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                            : "glass border-white/10 hover:bg-white/10"}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant={period === "monthly" ? "default" : "outline"}
                        onClick={() => setPeriod("monthly")}
                        className={period === "monthly"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                            : "glass border-white/10 hover:bg-white/10"}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={period === "annual" ? "default" : "outline"}
                        onClick={() => setPeriod("annual")}
                        className={period === "annual"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                            : "glass border-white/10 hover:bg-white/10"}
                    >
                        Annual
                    </Button>
                </div>

                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                        <p className="text-zinc-400 mt-4 text-lg font-medium">Loading analytics...</p>
                    </div>
                )}

                {error && (
                    <div className="glass border border-red-500/20 bg-red-500/5 p-6 rounded-2xl">
                        <p className="text-red-200 font-medium text-base">{error}</p>
                    </div>
                )}

                {!loading && !error && stats && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Revenue */}
                            <Card className="glass border-white/10 hover:border-green-500/50 transition-all duration-300 backdrop-blur-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
                                    <DollarSign className="h-5 w-5 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                        ${stats.totalRevenue.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">{getPeriodText()}</p>
                                </CardContent>
                            </Card>

                            {/* Total Orders */}
                            <Card className="glass border-white/10 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Orders</CardTitle>
                                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-white">
                                        {stats.totalOrders}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">{getPeriodText()}</p>
                                </CardContent>
                            </Card>

                            {/* Average Order Value */}
                            <Card className="glass border-white/10 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Avg Order Value</CardTitle>
                                    <Activity className="h-5 w-5 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                        ${stats.averageOrderValue.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">Per order</p>
                                </CardContent>
                            </Card>

                            {/* Growth */}
                            <Card className="glass border-white/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Growth</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-black flex items-center gap-2 ${stats.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stats.growthPercentage >= 0 ? <ArrowUp className="h-6 w-6" /> : <ArrowDown className="h-6 w-6" />}
                                        {Math.abs(stats.growthPercentage).toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">vs previous period</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Trend Chart */}
                        <Card className="glass border-white/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white">Revenue Trend</CardTitle>
                                <p className="text-sm text-zinc-400">Daily revenue for {getPeriodText().toLowerCase()}</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={stats.dailyData}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="url(#revenueGradient)"
                                            strokeWidth={3}
                                            dot={{ fill: '#8b5cf6', r: 4 }}
                                            activeDot={{ r: 6, fill: '#a78bfa' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Order Count Chart */}
                        <Card className="glass border-white/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white">Order Volume</CardTitle>
                                <p className="text-sm text-zinc-400">Daily order count for {getPeriodText().toLowerCase()}</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.dailyData}>
                                        <defs>
                                            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={12}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                                border: '1px solid rgba(20, 184, 166, 0.3)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            formatter={(value: number) => [value, 'Orders']}
                                        />
                                        <Bar
                                            dataKey="orderCount"
                                            fill="url(#orderGradient)"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
