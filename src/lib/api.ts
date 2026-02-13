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
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/books/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
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

export async function uploadBookImage(file: File): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/books/upload-image`, {
            method: "POST",
            headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to upload image.");
        }

        const data = await response.json();

        return {
            success: true,
            message: "Image uploaded successfully",
            data: data.path  // Returns the file path
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
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
        const token = localStorage.getItem("token");

        if (!token) {
            return {
                success: false,
                message: "Please login to place an order"
            };
        }

        const response = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Failed to create order";
            try {
                const errorData = await response.json();
                // Handle different error response formats
                errorMessage = errorData.message || errorData.title || errorData || errorMessage;
            } catch (e) {
                // If JSON parsing fails, try to get text
                try {
                    const textError = await response.text();
                    errorMessage = textError || `Failed to create order (Status: ${response.status})`;
                } catch (e2) {
                    errorMessage = `Failed to create order (Status: ${response.status})`;
                }
            }
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

// Analytics Interfaces
export interface OrderStatistics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    growthPercentage: number;
    dailyData: DailyOrderData[];
}

export interface DailyOrderData {
    date: string;
    orderCount: number;
    revenue: number;
}

// Analytics API Functions
export async function getWeeklyAnalytics(): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/orders/analytics/weekly`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to fetch weekly analytics");
        }

        const data = await response.json();
        return {
            success: true,
            message: "Weekly analytics fetched successfully",
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

export async function getMonthlyAnalytics(): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/orders/analytics/monthly`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to fetch monthly analytics");
        }

        const data = await response.json();
        return {
            success: true,
            message: "Monthly analytics fetched successfully",
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

export async function getAnnualAnalytics(): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/orders/analytics/annual`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to fetch annual analytics");
        }

        const data = await response.json();
        return {
            success: true,
            message: "Annual analytics fetched successfully",
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
