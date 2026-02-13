"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, UserPlus, LogOut, Menu, X, Users, LogIn, User, BookOpen, ShoppingBag, ShoppingCart, BarChart } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { getUserRole, type UserRole } from "@/lib/auth"

// Define navigation items with role requirements
const sidebarItems: Array<{
    title: string
    href: string
    icon: typeof LayoutDashboard
    roles?: UserRole[] // undefined means available to all users
    requiresAuth?: boolean // if true, only show when logged in
    hideWhenAuth?: boolean // if true, only show when logged out
}> = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: BarChart,
            roles: ["Admin", "SuperAdmin"], // Only Admin and SuperAdmin
            requiresAuth: true,
        },
        {
            title: "Books",
            href: "/books",
            icon: BookOpen,
            // All users can browse books
        },
        {
            title: "Cart",
            href: "/cart",
            icon: ShoppingCart,
            requiresAuth: true,
        },
        {
            title: "Orders",
            href: "/orders",
            icon: ShoppingBag,
            roles: ["Admin", "SuperAdmin"], // Admin and SuperAdmin see all orders
            requiresAuth: true,
        },
        {
            title: "Users",
            href: "/users",
            icon: Users,
            roles: ["SuperAdmin"], // Only SuperAdmin
            requiresAuth: true,
        },
        {
            title: "Profile",
            href: "/profile",
            icon: User,
            requiresAuth: true,
        },
        {
            title: "Login",
            href: "/login",
            icon: LogIn,
            hideWhenAuth: true, // Hide when logged in
        },
        {
            title: "Register",
            href: "/register",
            icon: UserPlus,
            hideWhenAuth: true, // Hide when logged in
        },
    ]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
<<<<<<< HEAD
=======
    const { totalItems } = useCart()
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        // Get user role and auth status
        // Re-check on every pathname change to ensure state is updated after login
        setUserRole(getUserRole())
        setIsLoggedIn(!!localStorage.getItem("token"))
    }, [pathname])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }
>>>>>>> eafdb5d (Fix API authentication and improve RBAC UI controls)

    // Filter sidebar items based on user role and auth status
    const visibleItems = sidebarItems.filter(item => {
        // If item should hide when authenticated
        if (item.hideWhenAuth && isLoggedIn) return false

        // If item requires auth and user is not logged in
        if (item.requiresAuth && !isLoggedIn) return false

        // If item has role requirements
        if (item.roles && userRole) {
            return item.roles.includes(userRole)
        }

        // If item has role requirements but user is not logged in
        if (item.roles && !userRole) return false

        // Show item (no restrictions or all conditions met)
        return true
    })

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
                        {visibleItems.map((item) => {
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
                                </Link>
                            )
                        })}
                    </nav>

<<<<<<< HEAD
    <div className="pt-6 border-t border-white/10 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
    </div>
=======
                    {isLoggedIn && (
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
                    )}
>>>>>>> eafdb5d (Fix API authentication and improve RBAC UI controls)
                </div >
            </div >

        {/* Overlay for mobile */ }
    {
        isOpen && (
            <div
                className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
                onClick={() => setIsOpen(false)}
            />
        )
    }
        </>
    )
}
