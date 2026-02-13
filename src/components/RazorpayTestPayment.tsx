"use client"

import { useState } from "react";
import { createRazorpayOrder, verifyPayment } from "@/lib/payment-api";
import Script from "next/script";

// Declare Razorpay type for TypeScript
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayTestPayment() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePayment = async () => {
        try {
            setLoading(true);
            setMessage("");

            // Step 1: Create Razorpay Order
            const orderResponse = await createRazorpayOrder({
                amount: 100, // ₹100
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            });

            if (!orderResponse.success) {
                setMessage(`Error: ${orderResponse.message}`);
                setLoading(false);
                return;
            }

            const { orderId, amount } = orderResponse.data;

            // Step 2: Open Razorpay Checkout
            const options = {
                key: "rzp_test_YOUR_KEY_ID_HERE", // Replace with your actual Razorpay Test Key ID
                amount: amount * 100, // Amount in paise
                currency: "INR",
                name: "Book Store",
                description: "Test Payment Transaction",
                order_id: orderId,
                handler: async function (response: any) {
                    // Step 3: Verify Payment Signature
                    setMessage("Verifying payment...");

                    const verifyResponse = await verifyPayment({
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature
                    });

                    if (verifyResponse.success) {
                        setMessage("✅ Payment Successful! Payment verified.");
                        console.log("Payment Details:", verifyResponse.data);
                    } else {
                        setMessage("❌ Payment verification failed!");
                    }

                    setLoading(false);
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366f1"
                },
                modal: {
                    ondismiss: function () {
                        setMessage("Payment cancelled");
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error: any) {
            console.error("Payment error:", error);
            setMessage(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <>
            {/* Load Razorpay Checkout Script */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />

            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Razorpay Test Payment
                </h2>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold mb-2">
                        🧪 Test Mode Instructions:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Use card: 4111 1111 1111 1111</li>
                        <li>• CVV: Any 3 digits (e.g., 123)</li>
                        <li>• Expiry: Any future date (e.g., 12/25)</li>
                        <li>• Amount: ₹100</li>
                    </ul>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        }`}
                >
                    {loading ? "Processing..." : "Pay ₹100 with Razorpay"}
                </button>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes("✅")
                            ? "bg-green-50 text-green-800"
                            : message.includes("❌")
                                ? "bg-red-50 text-red-800"
                                : "bg-yellow-50 text-yellow-800"
                        }`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                        <strong>Note:</strong> This is a test payment. No real money will be charged.
                    </p>
                </div>
            </div>
        </>
    );
}
