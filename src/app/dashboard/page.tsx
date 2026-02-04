"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                    <p className="text-zinc-400">Overview of your intergalactic empire.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="glass border-0 hover:bg-white/10 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-200">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass border-0 text-white">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3 glass border-0 text-white">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">U{i}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">User {i}</p>
                                        <p className="text-xs text-zinc-500">user{i}@example.com</p>
                                    </div>
                                    <div className="ml-auto font-medium text-white">+$1,999.00</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
