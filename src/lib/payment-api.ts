// Razorpay Payment Interfaces
export interface CreateRazorpayOrderRequest {
    amount: number;
    currency: string;
    receipt: string;
}

export interface CreateRazorpayOrderResponse {
    success: boolean;
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    message: string;
}

export interface VerifyPaymentRequest {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    paymentId: string;
    orderId: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

const BASE_URL = "http://localhost:5159/api";

// Razorpay Payment API Functions
export async function createRazorpayOrder(payload: CreateRazorpayOrderRequest): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            return {
                success: false,
                message: "Please login to create payment order"
            };
        }

        const response = await fetch(`${BASE_URL}/payment/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Failed to create payment order";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.title || errorMessage;
            } catch (e) {
                errorMessage = `Failed to create payment order (Status: ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Payment order created successfully",
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

export async function verifyPayment(payload: VerifyPaymentRequest): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            return {
                success: false,
                message: "Please login to verify payment"
            };
        }

        const response = await fetch(`${BASE_URL}/payment/verify-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}) \n
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Payment verification failed";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.title || errorMessage;
            } catch (e) {
                errorMessage = `Payment verification failed (Status: ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        return {
            success: true,
            message: "Payment verified successfully",
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
