using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;
using UserManagementApi.DTOs;
using UserManagementApi.Models;

namespace UserManagementApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly RazorpaySettings _razorpaySettings;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IOptions<RazorpaySettings> razorpaySettings, ILogger<PaymentController> logger)
        {
            _razorpaySettings = razorpaySettings.Value;
            _logger = logger;
        }

        // POST: api/payment/create-order
        [HttpPost("create-order")]
        [Authorize(Policy = "CustomerOrAbove")]
        public ActionResult<CreateRazorpayOrderResponse> CreateOrder([FromBody] CreateRazorpayOrderRequest request)
        {
            try
            {
                // Validate amount
                if (request.Amount <= 0)
                {
                    return BadRequest(new CreateRazorpayOrderResponse
                    {
                        Success = false,
                        Message = "Amount must be greater than zero"
                    });
                }

                // Initialize Razorpay client
                RazorpayClient client = new RazorpayClient(_razorpaySettings.KeyId, _razorpaySettings.KeySecret);

                // Convert amount from rupees to paise (Razorpay accepts amount in smallest currency unit)
                int amountInPaise = (int)(request.Amount * 100);

                // Create order options
                Dictionary<string, object> options = new Dictionary<string, object>
                {
                    { "amount", amountInPaise },
                    { "currency", request.Currency },
                    { "receipt", request.Receipt },
                    { "payment_capture", 1 } // Auto capture payment
                };

                // Create order - fully qualify the type to avoid ambiguity
                Razorpay.Api.Order order = client.Order.Create(options);

                _logger.LogInformation($"Razorpay order created: {order["id"]}");

                return Ok(new CreateRazorpayOrderResponse
                {
                    Success = true,
                    OrderId = order["id"].ToString(),
                    Amount = Convert.ToDecimal(order["amount"]) / 100, // Convert paise back to rupees
                    Currency = order["currency"].ToString(),
                    Receipt = order["receipt"]?.ToString() ?? "",
                    Status = order["status"].ToString(),
                    Message = "Order created successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Razorpay order");
                return StatusCode(500, new CreateRazorpayOrderResponse
                {
                    Success = false,
                    Message = $"Failed to create order: {ex.Message}"
                });
            }
        }

        // POST: api/payment/verify-payment
        [HttpPost("verify-payment")]
        [Authorize(Policy = "CustomerOrAbove")]
        public ActionResult<VerifyPaymentResponse> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrEmpty(request.OrderId) ||
                    string.IsNullOrEmpty(request.PaymentId) ||
                    string.IsNullOrEmpty(request.Signature))
                {
                    return BadRequest(new VerifyPaymentResponse
                    {
                        Success = false,
                        Message = "Missing required payment verification parameters"
                    });
                }

                // Generate signature
                string payload = $"{request.OrderId}|{request.PaymentId}";
                string generatedSignature = GenerateSignature(payload, _razorpaySettings.KeySecret);

                // Verify signature
                if (generatedSignature == request.Signature)
                {
                    _logger.LogInformation($"Payment verified successfully: {request.PaymentId}");

                    return Ok(new VerifyPaymentResponse
                    {
                        Success = true,
                        Message = "Payment verified successfully",
                        PaymentId = request.PaymentId,
                        OrderId = request.OrderId
                    });
                }
                else
                {
                    _logger.LogWarning($"Payment signature verification failed for payment: {request.PaymentId}");

                    return BadRequest(new VerifyPaymentResponse
                    {
                        Success = false,
                        Message = "Payment signature verification failed",
                        PaymentId = request.PaymentId,
                        OrderId = request.OrderId
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying payment");
                return StatusCode(500, new VerifyPaymentResponse
                {
                    Success = false,
                    Message = $"Failed to verify payment: {ex.Message}"
                });
            }
        }

        // Helper method to generate HMAC SHA256 signature
        private string GenerateSignature(string payload, string secret)
        {
            var encoding = new UTF8Encoding();
            byte[] keyBytes = encoding.GetBytes(secret);
            byte[] messageBytes = encoding.GetBytes(payload);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                byte[] hashBytes = hmac.ComputeHash(messageBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }
}
