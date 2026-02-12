export interface RegisterUserPayload {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface LoginResponse {
    user: User;
    token: string;
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

        if (!response.ok) {
            let errorMessage = "Registration failed.";
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();

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

export async function loginUser(payload: LoginPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Login failed.";
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Store token in localStorage
        if (data.success && data.data.token) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        return {
            success: true,
            message: data.message || "Login successful",
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

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/users/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to initiate password reset.");
        }

        return {
            success: true,
            message: data.message || "OTP sent successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/users/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to reset password.");
        }

        return {
            success: true,
            message: data.message || "Password reset successful",
            data: data
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            let errorMessage = "Failed to fetch users.";
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();

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
export interface Book {
    id: number;
    googleBookId?: string;
    title: string;
    subtitle?: string;
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount: number;
    printType?: string;
    language?: string;
    thumbnailUrl?: string;
    infoLink?: string;
    stockQuantity: number;
    unitPrice: number;
    authorNames: string[];
    categoryNames: string[];
}

export interface CreateBookPayload {
    googleBookId?: string;
    title: string;
    subtitle?: string;
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount: number;
    printType?: string;
    language?: string;
    thumbnailUrl?: string;
    infoLink?: string;
    stockQuantity: number;
    unitPrice: number;
    authorNames: string[];
    categoryNames: string[];
}

export async function getBooks(): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/books`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Books fetched successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function getBook(id: number): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/books/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch book detail: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Book fetched successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function createBook(payload: CreateBookPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to create book: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Book created successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function updateBook(id: number, payload: CreateBookPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Failed to update book.");
        }

        return {
            success: true,
            message: "Book updated successfully"
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function deleteBook(id: number): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/books/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete book.");
        }

        return {
            success: true,
            message: "Book deleted successfully"
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}
export interface Order {
    id: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalPrice: number;
    orderDate: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    bookId: number;
    bookTitle?: string;
    thumbnailUrl?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface CreateOrderPayload {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: CreateOrderItemPayload[];
}

export interface CreateOrderItemPayload {
    bookId: number;
    quantity: number;
}

export async function getOrders(): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Orders fetched successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiResponse> {
    try {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = `Failed to create order: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Order created successfully",
            data: data
        };

    } catch (error: any) {
        console.error("API Error:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred."
        };
    }
}
