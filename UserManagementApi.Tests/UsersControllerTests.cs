using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using UserManagementApi.Controllers;
using UserManagementApi.Data;
using UserManagementApi.Models;
using UserManagementApi.DTOs;
using System.IdentityModel.Tokens.Jwt;

namespace UserManagementApi.Tests.Controllers
{
    public class UsersControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UsersController _controller;
        private readonly Mock<ILogger<UsersController>> _mockLogger;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public UsersControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            
            // Setup mocks
            _mockLogger = new Mock<ILogger<UsersController>>();
            _mockConfiguration = new Mock<IConfiguration>();

            // Setup JWT configuration
            var jwtSection = new Mock<IConfigurationSection>();
            jwtSection.Setup(x => x["Key"]).Returns("ThisIsASecretKeyForJWTTokenGenerationWithAtLeast32Characters");
            jwtSection.Setup(x => x["Issuer"]).Returns("UserManagementApi");
            jwtSection.Setup(x => x["Audience"]).Returns("UserManagementClient");
            jwtSection.Setup(x => x["ExpiryInMinutes"]).Returns("60");
            
            _mockConfiguration.Setup(x => x.GetSection("Jwt")).Returns(jwtSection.Object);

            // Create controller
            _controller = new UsersController(_context, _mockLogger.Object, _mockConfiguration.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region Login Tests

        [Fact]
        public async Task Login_ReturnsToken_WhenCredentialsAreValid()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "Customer"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            dynamic value = okResult.Value!;
            Assert.True((bool)value.success);
            Assert.NotNull(value.data);
            Assert.NotNull(value.data.Token);
            Assert.Equal("testuser", value.data.User.Username);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenEmailIsInvalid()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            dynamic value = unauthorizedResult.Value!;
            Assert.False((bool)value.success);
            Assert.Contains("Invalid", value.message.ToString());
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsInvalid()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
                Role = "Customer"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result.Result);
        }

        [Fact]
        public async Task Login_TokenContainsCorrectClaims()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "SuperAdmin"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            dynamic value = okResult.Value!;
            string token = value.data.Token;

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            Assert.Contains(jwtToken.Claims, c => c.Type == "unique_name" && c.Value == "testuser");
            Assert.Contains(jwtToken.Claims, c => c.Type == "email" && c.Value == "test@example.com");
            Assert.Contains(jwtToken.Claims, c => c.Type == "role" && c.Value == "SuperAdmin");
        }

        #endregion

        #region Register Tests

        [Fact]
        public async Task Register_CreatesUser_WithValidData()
        {
            // Arrange
            var registerDto = new RegisterUserDto
            {
                Username = "newuser",
                Email = "newuser@example.com",
                Password = "Password123",
                Role = "Customer"
            };

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            dynamic value = okResult.Value!;
            Assert.True((bool)value.success);
            Assert.Equal("newuser", value.data.Username);

            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "newuser@example.com");
            Assert.NotNull(userInDb);
            Assert.Equal("Customer", userInDb.Role);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailAlreadyExists()
        {
            // Arrange
            var existingUser = new User
            {
                Username = "existing",
                Email = "existing@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "Customer"
            };
            _context.Users.Add(existingUser);
            await _context.SaveChangesAsync();

            var registerDto = new RegisterUserDto
            {
                Username = "newuser",
                Email = "existing@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            dynamic value = badRequestResult.Value!;
            Assert.False((bool)value.success);
            Assert.Contains("Email already exists", value.message.ToString());
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenUsernameAlreadyExists()
        {
            // Arrange
            var existingUser = new User
            {
                Username = "existinguser",
                Email = "existing@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "Customer"
            };
            _context.Users.Add(existingUser);
            await _context.SaveChangesAsync();

            var registerDto = new RegisterUserDto
            {
                Username = "existinguser",
                Email = "newuser@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            dynamic value = badRequestResult.Value!;
            Assert.False((bool)value.success);
            Assert.Contains("Username already exists", value.message.ToString());
        }

        [Fact]
        public async Task Register_HashesPassword_BeforeStoringInDatabase()
        {
            // Arrange
            var registerDto = new RegisterUserDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "PlainTextPassword",
                Role = "Customer"
            };

            // Act
            await _controller.Register(registerDto);

            // Assert
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.NotNull(userInDb);
            Assert.NotEqual("PlainTextPassword", userInDb.PasswordHash);
            Assert.True(BCrypt.Net.BCrypt.Verify("PlainTextPassword", userInDb.PasswordHash));
        }

        [Fact]
        public async Task Register_DefaultsToCustomerRole_WhenRoleNotSpecified()
        {
            // Arrange
            var registerDto = new RegisterUserDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123",
                Role = null
            };

            // Act
            await _controller.Register(registerDto);

            // Assert
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.NotNull(userInDb);
            Assert.Equal("Customer", userInDb.Role);
        }

        #endregion

        #region ForgotPassword Tests

        [Fact]
        public async Task ForgotPassword_GeneratesOTP_WhenEmailExists()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "Customer"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new ForgotPasswordDto { Email = "test@example.com" };

            // Act
            var result = await _controller.ForgotPassword(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.NotNull(userInDb!.ResetOtp);
            Assert.NotNull(userInDb.ResetOtpExpiry);
            Assert.True(userInDb.ResetOtpExpiry > DateTime.UtcNow);
        }

        [Fact]
        public async Task ForgotPassword_ReturnsOk_EvenWhenEmailDoesNotExist()
        {
            // Arrange - security measure to not reveal if email exists
            var dto = new ForgotPasswordDto { Email = "nonexistent@example.com" };

            // Act
            var result = await _controller.ForgotPassword(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic value = okResult.Value!;
            Assert.True((bool)value.success);
        }

        [Fact]
        public async Task ForgotPassword_OTPIsExactly6Digits()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "Customer"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new ForgotPasswordDto { Email = "test@example.com" };

            // Act
            await _controller.ForgotPassword(dto);

            // Assert
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.NotNull(userInDb!.ResetOtp);
            Assert.Equal(6, userInDb.ResetOtp!.Length);
            Assert.True(int.TryParse(userInDb.ResetOtp, out _));
        }

        #endregion

        #region ResetPassword Tests

        [Fact]
        public async Task ResetPassword_ResetsPassword_WhenOTPIsValid()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword"),
                Role = "Customer",
                ResetOtp = "123456",
                ResetOtpExpiry = DateTime.UtcNow.AddMinutes(10)
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new ResetPasswordDto
            {
                Email = "test@example.com",
                Otp = "123456",
                NewPassword = "NewPassword123"
            };

            // Act
            var result = await _controller.ResetPassword(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123", userInDb!.PasswordHash));
            Assert.Null(userInDb.ResetOtp);
            Assert.Null(userInDb.ResetOtpExpiry);
        }

        [Fact]
        public async Task ResetPassword_ReturnsBadRequest_WhenOTPIsInvalid()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword"),
                Role = "Customer",
                ResetOtp = "123456",
                ResetOtpExpiry = DateTime.UtcNow.AddMinutes(10)
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new ResetPasswordDto
            {
                Email = "test@example.com",
                Otp = "999999",
                NewPassword = "NewPassword123"
            };

            // Act
            var result = await _controller.ResetPassword(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            dynamic value = badRequestResult.Value!;
            Assert.False((bool)value.success);
            Assert.Contains("Invalid or expired", value.message.ToString());
        }

        [Fact]
        public async Task ResetPassword_ReturnsBadRequest_WhenOTPIsExpired()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword"),
                Role = "Customer",
                ResetOtp = "123456",
                ResetOtpExpiry = DateTime.UtcNow.AddMinutes(-1) // Expired
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new ResetPasswordDto
            {
                Email = "test@example.com",
                Otp = "123456",
                NewPassword = "NewPassword123"
            };

            // Act
            var result = await _controller.ResetPassword(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            dynamic value = badRequestResult.Value!;
            Assert.False((bool)value.success);
        }

        #endregion
    }
}
