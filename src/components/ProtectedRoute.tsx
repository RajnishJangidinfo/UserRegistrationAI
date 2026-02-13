'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAuthenticated, hasPermission, UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
    redirectTo?: string
}

/**
 * Higher-order component to protect routes based on authentication and role
 * Usage:
 * <ProtectedRoute requiredRole="Admin">
 *   <YourComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            router.push(redirectTo)
            return
        }

        // Check if user has required role
        if (requiredRole && !hasPermission(requiredRole)) {
            router.push('/unauthorized')
            return
        }

        // User is authorized
        setIsAuthorized(true)
    }, [router, requiredRole, redirectTo])

    // Don't render children until authorization check is complete
    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="text-zinc-400 mt-4 text-lg font-medium">Verifying access...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
