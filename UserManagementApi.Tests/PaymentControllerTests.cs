using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using UserManagementApi.Controllers;
using UserManagementApi.DTOs;
using UserManagementApi.Models;
using Xunit;

namespace UserManagementApi.Tests
{
    public class PaymentControllerTests
    {
        private readonly Mock<IOptions<RazorpaySettings>> _mockRazorpaySettings;
        private readonly Mock<ILogger<PaymentController>> _mockLogger;
        private readonly PaymentController _controller;

        public PaymentControllerTests()
        {
            _mockRazorpaySettings = new Mock<IOptions<RazorpaySettings>>();
            _mockLogger = new Mock<ILogger<PaymentController>>();

            // Setup test Razorpay settings
            var razorpaySettings = new RazorpaySettings
            {
                KeyId = "rzp_test_1234567890",
                KeySecret = "test_secret_key_1234567890"
            };
            _mockRazorpaySettings.Setup(x => x.Value).Returns(razorpaySettings);

            _controller = new PaymentController(_mockRazorpaySettings.Object, _mockLogger.Object);
        }

        #region CreateOrder Validation Tests

        [Fact]
        public void CreateOrder_WithZeroAmount_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateRazorpayOrderRequest
            {
                Amount = 0,
                Currency = "INR",
                Receipt = "receipt_123"
            };

            // Act
            var result = _controller.CreateOrder(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<CreateRazorpayOrderResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Amount must be greater than zero", response.Message);
        }

        [Fact]
        public void CreateOrder_WithNegativeAmount_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateRazorpayOrderRequest
            {
                Amount = -50,
                Currency = "INR",
                Receipt = "receipt_123"
            };

            // Act
            var result = _controller.CreateOrder(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<CreateRazorpayOrderResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Amount must be greater than zero", response.Message);
        }

        #endregion

        #region VerifyPayment Tests

        [Fact]
        public void VerifyPayment_WithValidSignature_ReturnsOkResult()
        {
            // Arrange
            var orderId = "order_123";
            var paymentId = "pay_456";
            
            // Generate valid signature using the same algorithm as the controller
            var payload = $"{orderId}|{paymentId}";
            var secret = "test_secret_key_1234567890";
            var signature = GenerateSignature(payload, secret);

            var request = new VerifyPaymentRequest
            {
                OrderId = orderId,
                PaymentId = paymentId,
                Signature = signature
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Payment verified successfully", response.Message);
            Assert.Equal(paymentId, response.PaymentId);
            Assert.Equal(orderId, response.OrderId);
        }

        [Fact]
        public void VerifyPayment_WithInvalidSignature_ReturnsBadRequest()
        {
            // Arrange
            var request = new VerifyPaymentRequest
            {
                OrderId = "order_123",
                PaymentId = "pay_456",
                Signature = "invalid_signature"
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Payment signature verification failed", response.Message);
        }

        [Fact]
        public void VerifyPayment_WithMissingOrderId_ReturnsBadRequest()
        {
            // Arrange
            var request = new VerifyPaymentRequest
            {
                OrderId = "",
                PaymentId = "pay_456",
                Signature = "some_signature"
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Missing required payment verification parameters", response.Message);
        }

        [Fact]
        public void VerifyPayment_WithMissingPaymentId_ReturnsBadRequest()
        {
            // Arrange
            var request = new VerifyPaymentRequest
            {
                OrderId = "order_123",
                PaymentId = "",
                Signature = "some_signature"
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Missing required payment verification parameters", response.Message);
        }

        [Fact]
        public void VerifyPayment_WithMissingSignature_ReturnsBadRequest()
        {
            // Arrange
            var request = new VerifyPaymentRequest
            {
                OrderId = "order_123",
                PaymentId = "pay_456",
                Signature = ""
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Missing required payment verification parameters", response.Message);
        }

        [Fact]
        public void VerifyPayment_WithNullValues_ReturnsBadRequest()
        {
            // Arrange
            var request = new VerifyPaymentRequest
            {
                OrderId = null!,
                PaymentId = null!,
                Signature = null!
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
        }

        [Fact]
        public void VerifyPayment_WithDifferentOrderIds_ProducesDifferentSignatures()
        {
            // Arrange
            var paymentId = "pay_456";
            var secret = "test_secret_key_1234567890";

            // Generate signature for order 1
            var orderId1 = "order_001";
            var payload1 = $"{orderId1}|{paymentId}";
            var signature1 = GenerateSignature(payload1, secret);

            // Generate signature for order 2
            var orderId2 = "order_002";
            var payload2 = $"{orderId2}|{paymentId}";
            var signature2 = GenerateSignature(payload2, secret);

            // Act & Assert
            Assert.NotEqual(signature1, signature2);
            
            // Verify that using wrong signature fails
            var request = new VerifyPaymentRequest
            {
                OrderId = orderId1,
                PaymentId = paymentId,
                Signature = signature2 // Using signature for order_002 with order_001
            };

            var result = _controller.VerifyPayment(request);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
        }

        [Fact]
        public void VerifyPayment_SignatureVerification_IsCaseSensitive()
        {
            // Arrange
            var orderId = "order_123";
            var paymentId = "pay_456";
            var payload = $"{orderId}|{paymentId}";
            var secret = "test_secret_key_1234567890";
            var signature = GenerateSignature(payload, secret);

            // Try with uppercase signature (should fail)
            var request = new VerifyPaymentRequest
            {
                OrderId = orderId,
                PaymentId = paymentId,
                Signature = signature.ToUpper()
            };

            // Act
            var result = _controller.VerifyPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<VerifyPaymentResponse>(badRequestResult.Value);
            Assert.False(response.Success);
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Helper method to generate HMAC SHA256 signature (same as controller)
        /// </summary>
        private string GenerateSignature(string payload, string secret)
        {
            var encoding = new System.Text.UTF8Encoding();
            byte[] keyBytes = encoding.GetBytes(secret);
            byte[] messageBytes = encoding.GetBytes(payload);

            using (var hmac = new System.Security.Cryptography.HMACSHA256(keyBytes))
            {
                byte[] hashBytes = hmac.ComputeHash(messageBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }

        #endregion
    }
}
