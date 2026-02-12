"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, UserPlus, LogOut, Menu, X, Users, LogIn, User, BookOpen, ShoppingBag, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Profile",
        href: "/profile",
        icon: User,
    },
    {
        title: "Books",
        href: "/books",
        icon: BookOpen,
    },
    {
        title: "Orders",
        href: "/orders",
        icon: ShoppingBag,
    },
    {
        title: "Cart",
        href: "/cart",
        icon: ShoppingCart,
    },
    {
        title: "Users",
        href: "/users",
        icon: Users,
    },
    {
        title: "Register User",
        href: "/register",
        icon: UserPlus,
    },
    {
        title: "Login",
        href: "/login",
        icon: LogIn,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const { totalItems } = useCart()

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-background/50 backdrop-blur-md border border-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 transform bg-zinc-950 border-r border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 glass-dark",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                            Infinite
                        </span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-white shadow-lg shadow-purple-500/10"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-purple-400" : "text-zinc-500")} />
                                    {item.title}
                                    {item.title === "Cart" && totalItems > 0 && (
                                        <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-in zoom-in duration-300">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
