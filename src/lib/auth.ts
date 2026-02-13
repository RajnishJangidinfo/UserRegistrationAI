// Frontend authorization utilities for RBAC

export type UserRole = "SuperAdmin" | "Admin" | "Customer"

export interface UserData {
    id: number
    username: string
    email: string
    role: UserRole
    createdAt: string
}

/**
 * Get the current user's role from localStorage
 */
export function getUserRole(): UserRole | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
        const user: UserData = JSON.parse(userStr)
        return user.role
    } catch {
        return null
    }
}

/**
 * Get the full user data from localStorage
 */
export function getUser(): UserData | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch {
        return null
    }
}

/**
 * Check if user has permission for a specific role or roles
 */
export function hasPermission(requiredRole: UserRole | UserRole[]): boolean {
    const userRole = getUserRole()
    if (!userRole) return false

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(userRole)
}

/**
 * Check if user can access a specific route based on their role
 */
export function canAccessRoute(route: string): boolean {
    const role = getUserRole()
    if (!role) return false

    // Define routes accessible by each role
    const rolePermissions: Record<UserRole, string[]> = {
        'SuperAdmin': ['dashboard', 'users', 'books', 'orders', 'analytics', 'settings', 'my-orders', 'profile'],
        'Admin': ['dashboard', 'books', 'orders', 'analytics', 'my-orders', 'profile'],
        'Customer': ['books', 'cart', 'my-orders', 'profile']
    }

    const allowedRoutes = rolePermissions[role] || []
    return allowedRoutes.some(r => route.includes(r))
}

/**
 * Check if the current user is authenticated
 */
export function isAuthenticated(): boolean {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    return !!(token && user)
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(): boolean {
    return getUserRole() === "SuperAdmin"
}

/**
 * Check if user is Admin or above (Admin or SuperAdmin)
 */
export function isAdminOrAbove(): boolean {
    const role = getUserRole()
    return role === "Admin" || role === "SuperAdmin"
}

/**
 * Check if user is Customer or above (any role)
 */
export function isCustomerOrAbove(): boolean {
    const role = getUserRole()
    return role === "Customer" || role === "Admin" || role === "SuperAdmin"
}

/**
 * Logout user and clear all auth data
 */
export function logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}
