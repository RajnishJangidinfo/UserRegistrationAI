namespace UserManagementApi.DTOs
{
    // Request to create Razorpay order
    public class CreateRazorpayOrderRequest
    {
        public decimal Amount { get; set; } // Amount in rupees
        public string Currency { get; set; } = "INR";
        public string Receipt { get; set; } = string.Empty;
    }

    // Response from Razorpay order creation
    public class CreateRazorpayOrderResponse
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; } // Amount in paise
        public string Currency { get; set; } = string.Empty;
        public string Receipt { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    // Request to verify payment
    public class VerifyPaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
    }

    // Response from payment verification
    public class VerifyPaymentResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
    }
}
