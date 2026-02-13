using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using UserManagementApi.Data;
using UserManagementApi.DTOs;
using UserManagementApi.Models;

namespace UserManagementApi.Tests.Integration
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the app's ApplicationDbContext registration
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add ApplicationDbContext using an in-memory database for testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("IntegrationTestDb_" + Guid.NewGuid());
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        #region Authentication Flow Tests

        [Fact]
        public async Task FullAuthFlow_Register_Login_Success()
        {
            // 1. Register a new user
            var registerDto = new RegisterUserDto
            {
                Username = "integrationuser",
                Email = "integration@example.com",
                Password = "Password123",
                Role = "Customer"
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/users/register", registerDto);
            Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

            // 2. Login with the registered user
            var loginDto = new LoginDto
            {
                Email = "integration@example.com",
                Password = "Password123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent);
            
            Assert.True(loginResult.GetProperty("success").GetBoolean());
            Assert.True(loginResult.GetProperty("data").GetProperty("Token").GetString()!.Length > 0);
        }

        [Fact]
        public async Task PasswordResetFlow_ForgotPassword_Reset_Success()
        {
            // 1. Register a user
            var registerDto = new RegisterUserDto
            {
                Username = "resetuser",
                Email = "reset@example.com",
                Password = "OldPassword123",
                Role = "Customer"
            };

            await _client.PostAsJsonAsync("/api/users/register", registerDto);

            // 2. Request password reset
            var forgotDto = new ForgotPasswordDto { Email = "reset@example.com" };
            var forgotResponse = await _client.PostAsJsonAsync("/api/users/forgot-password", forgotDto);
            Assert.Equal(HttpStatusCode.OK, forgotResponse.StatusCode);

            // 3. Get OTP from database (in real scenario, would be from email)
            string otp;
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var user = await context.Users.FirstOrDefaultAsync(u => u.Email == "reset@example.com");
                otp = user!.ResetOtp!;
            }

            // 4. Reset password with OTP
            var resetDto = new ResetPasswordDto
            {
                Email = "reset@example.com",
                Otp = otp,
                NewPassword = "NewPassword123"
            };

            var resetResponse = await _client.PostAsJsonAsync("/api/users/reset-password", resetDto);
            Assert.Equal(HttpStatusCode.OK, resetResponse.StatusCode);

            // 5. Login with new password
            var loginDto = new LoginDto
            {
                Email = "reset@example.com",
                Password = "NewPassword123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        }

        #endregion

        #region Role-Based Access Control Tests

        [Fact]
        public async Task SuperAdmin_CanAccessAllEndpoints()
        {
            // Create SuperAdmin user
            string token;
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var superAdmin = new User
                {
                    Username = "superadmin",
                    Email = "superadmin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "SuperAdmin"
                };
                context.Users.Add(superAdmin);
                await context.SaveChangesAsync();
            }

            // Login as SuperAdmin
            var loginDto = new LoginDto
            {
                Email = "superadmin@test.com",
                Password = "Admin@123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent);
            token = loginResult.GetProperty("data").GetProperty("Token").GetString()!;

            // Test access to SuperAdmin-only endpoint (GetUsers)
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var usersResponse = await _client.GetAsync("/api/users");
            Assert.Equal(HttpStatusCode.OK, usersResponse.StatusCode);

            // Test access to Admin-level endpoint (GetOrders)
            var ordersResponse = await _client.GetAsync("/api/orders");
            Assert.Equal(HttpStatusCode.OK, ordersResponse.StatusCode);
        }

        [Fact]
        public async Task Admin_CanAccessAdminEndpoints_ButNotSuperAdmin()
        {
            // Create Admin user
            string token;
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin"
                };
                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }

            // Login as Admin
            var loginDto = new LoginDto
            {
                Email = "admin@test.com",
                Password = "Admin@123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent);
            token = loginResult.GetProperty("data").GetProperty("Token").GetString()!;

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Admin should be able to access Orders
            var ordersResponse = await _client.GetAsync("/api/orders");
            Assert.Equal(HttpStatusCode.OK, ordersResponse.StatusCode);

            // Admin should NOT be able to access SuperAdmin-only Users endpoint
            var usersResponse = await _client.GetAsync("/api/users");
            Assert.Equal(HttpStatusCode.Forbidden, usersResponse.StatusCode);
        }

        [Fact]
        public async Task Customer_CannotAccessAdminEndpoints()
        {
            // Create Customer user
            string token;
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var customer = new User
                {
                    Username = "customer",
                    Email = "customer@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                    Role = "Customer"
                };
                context.Users.Add(customer);
                await context.SaveChangesAsync();
            }

            // Login as Customer
            var loginDto = new LoginDto
            {
                Email = "customer@test.com",
                Password = "Customer@123"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent);
            token = loginResult.GetProperty("data").GetProperty("Token").GetString()!;

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Customer should NOT access admin endpoints
            var ordersResponse = await _client.GetAsync("/api/orders");
            Assert.Equal(HttpStatusCode.Forbidden, ordersResponse.StatusCode);

            var usersResponse = await _client.GetAsync("/api/users");
            Assert.Equal(HttpStatusCode.Forbidden, usersResponse.StatusCode);
        }

        #endregion

        #region End-to-End Workflow Tests

        [Fact]
        public async Task CompleteBookPurchaseWorkflow_Success()
        {
            // 1. Create Admin and add a book
            string adminToken;
            int bookId;

            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@workflow.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin"
                };
                
                var book = new Book
                {
                    Title = "Test Book for Purchase",
                    UnitPrice = 29.99m,
                    StockQuantity = 10
                };

                context.Users.Add(admin);
                context.Books.Add(book);
                await context.SaveChangesAsync();
                
                bookId = book.Id;
            }

            // Login as Admin
            var adminLogin = new LoginDto { Email = "admin@workflow.com", Password = "Admin@123" };
            var adminLoginResponse = await _client.PostAsJsonAsync("/api/users/login", adminLogin);
            var adminLoginContent = await adminLoginResponse.Content.ReadAsStringAsync();
            var adminLoginResult = JsonSerializer.Deserialize<JsonElement>(adminLoginContent);
            adminToken = adminLoginResult.GetProperty("data").GetProperty("Token").GetString()!;

            // 2. Register Customer
            var customerRegister = new RegisterUserDto
            {
                Username = "buyer",
                Email = "buyer@workflow.com",
                Password = "Customer@123",
                Role = "Customer"
            };
            await _client.PostAsJsonAsync("/api/users/register", customerRegister);

            // Login as Customer
            var customerLogin = new LoginDto { Email = "buyer@workflow.com", Password = "Customer@123" };
            var customerLoginResponse = await _client.PostAsJsonAsync("/api/users/login", customerLogin);
            var customerLoginContent = await customerLoginResponse.Content.ReadAsStringAsync();
            var customerLoginResult = JsonSerializer.Deserialize<JsonElement>(customerLoginContent);
            var customerToken = customerLoginResult.GetProperty("data").GetProperty("Token").GetString()!;

            // 3. Customer views books (public endpoint)
            var booksResponse = await _client.GetAsync("/api/books");
            Assert.Equal(HttpStatusCode.OK, booksResponse.StatusCode);

            // 4. Customer places order
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
            
            var orderDto = new CreateOrderDto
            {
                CustomerName = "Buyer Name",
                CustomerEmail = "buyer@workflow.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = bookId, Quantity = 2 }
                }
            };

            var orderResponse = await _client.PostAsJsonAsync("/api/orders", orderDto);
            Assert.Equal(HttpStatusCode.OK, orderResponse.StatusCode);

            // 5. Admin views orders
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var allOrdersResponse = await _client.GetAsync("/api/orders");
            Assert.Equal(HttpStatusCode.OK, allOrdersResponse.StatusCode);

            var ordersContent = await allOrdersResponse.Content.ReadAsStringAsync();
            var orders = JsonSerializer.Deserialize<JsonElement>(ordersContent);
            Assert.True(orders.GetArrayLength() > 0);
        }

        [Fact]
        public async Task SuperAdminBypass_WorksAcrossAllEndpoints()
        {
            // Create SuperAdmin
            string token;
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var superAdmin = new User
                {
                    Username = "super",
                    Email = "super@bypass.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Super@123"),
                    Role = "SuperAdmin"
                };

                var book = new Book
                {
                    Title = "Bypass Test Book",
                    UnitPrice = 19.99m,
                    StockQuantity = 5
                };

                context.Users.Add(superAdmin);
                context.Books.Add(book);
                await context.SaveChangesAsync();
            }

            // Login as SuperAdmin
            var loginDto = new LoginDto { Email = "super@bypass.com", Password = "Super@123" };
            var loginResponse = await _client.PostAsJsonAsync("/api/users/login", loginDto);
            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent);
            token = loginResult.GetProperty("data").GetProperty("Token").GetString()!;

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // SuperAdmin should access ALL endpoints
            var usersResponse = await _client.GetAsync("/api/users");
            Assert.Equal(HttpStatusCode.OK, usersResponse.StatusCode);

            var ordersResponse = await _client.GetAsync("/api/orders");
            Assert.Equal(HttpStatusCode.OK, ordersResponse.StatusCode);

            var booksResponse = await _client.GetAsync("/api/books");
            Assert.Equal(HttpStatusCode.OK, booksResponse.StatusCode);

            var analyticsResponse = await _client.GetAsync("/api/orders/analytics/weekly");
            Assert.Equal(HttpStatusCode.OK, analyticsResponse.StatusCode);
        }

        #endregion
    }
}
