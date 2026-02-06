export interface RegisterUserPayload {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

const BASE_URL = "http://localhost:5159/api";

export async function registerUser(payload: RegisterUserPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed. Please try again.");
        }

        return {
            success: true,
            message: data.message || "User registered successfully",
            data: data.data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function getUsers(): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch users.");
        }

        return {
            success: true,
            message: "Users fetched successfully",
            data: data.data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}
