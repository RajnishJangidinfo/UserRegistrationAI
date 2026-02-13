using Xunit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using UserManagementApi.Authorization;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;

namespace UserManagementApi.Tests.Authorization
{
    public class AuthorizationTests
    {
        private readonly Mock<ILogger<SuperAdminAuthorizationHandler>> _mockLogger;

        public AuthorizationTests()
        {
            _mockLogger = new Mock<ILogger<SuperAdminAuthorizationHandler>>();
        }

        #region SuperAdmin Bypass Tests

        [Fact]
        public async Task SuperAdminHandler_SucceedsAllRequirements_ForSuperAdminUser()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "superadmin"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, "TestAuth"));

            var requirements = new IAuthorizationRequirement[]
            {
                new RolesAuthorizationRequirement(new[] { "Admin" }),
                new RolesAuthorizationRequirement(new[] { "Customer" }),
                new DenyAnonymousAuthorizationRequirement()
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert
            Assert.True(context.HasSucceeded);
            Assert.Empty(context.PendingRequirements);
        }

        [Fact]
        public async Task SuperAdminHandler_DoesNotSucceed_ForNonSuperAdminUser()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "2"),
                new Claim(ClaimTypes.Name, "admin"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "TestAuth"));

            var requirements = new IAuthorizationRequirement[]
            {
                new RolesAuthorizationRequirement(new[] { "SuperAdmin" })
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert
            Assert.False(context.HasSucceeded);
            Assert.NotEmpty(context.PendingRequirements);
        }

        [Fact]
        public async Task SuperAdminHandler_DoesNotSucceed_ForUnauthenticatedUser()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity()); // Not authenticated

            var requirements = new IAuthorizationRequirement[]
            {
                new DenyAnonymousAuthorizationRequirement()
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert
            Assert.False(context.HasSucceeded);
            Assert.NotEmpty(context.PendingRequirements);
        }

        [Fact]
        public async Task SuperAdminHandler_BypassesRoleRequirement()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "superadmin"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, "TestAuth"));

            // Requirement that SuperAdmin doesn't explicitly have
            var requirements = new IAuthorizationRequirement[]
            {
                new RolesAuthorizationRequirement(new[] { "SpecialRole" })
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert - SuperAdmin should bypass the SpecialRole requirement
            Assert.True(context.HasSucceeded);
        }

        [Fact]
        public async Task SuperAdminHandler_HandlesMultipleRequirements()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "superadmin"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, "TestAuth"));

            var requirements = new IAuthorizationRequirement[]
            {
                new RolesAuthorizationRequirement(new[] { "Admin" }),
                new RolesAuthorizationRequirement(new[] { "Manager" }),
                new RolesAuthorizationRequirement(new[] { "Executive" }),
                new DenyAnonymousAuthorizationRequirement()
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert - All requirements should be satisfied
            Assert.True(context.HasSucceeded);
            Assert.Empty(context.PendingRequirements);
        }

        #endregion

        #region Role Hierarchy Tests

        [Fact]
        public void RolesAuthorizationRequirement_AdminRole_IsValid()
        {
            // Arrange
            var requirement = new RolesAuthorizationRequirement(new[] { "Admin" });

            // Assert
            Assert.Contains("Admin", requirement.AllowedRoles);
        }

        [Fact]
        public void RolesAuthorizationRequirement_MultipleRoles_AreValid()
        {
            // Arrange
            var requirement = new RolesAuthorizationRequirement(new[] { "Admin", "SuperAdmin", "Customer" });

            // Assert
            Assert.Equal(3, requirement.AllowedRoles.Count());
            Assert.Contains("Admin", requirement.AllowedRoles);
            Assert.Contains("SuperAdmin", requirement.AllowedRoles);
            Assert.Contains("Customer", requirement.AllowedRoles);
        }

        [Fact]
        public async Task SuperAdminHandler_LogsAccessGrant()
        {
            // Arrange
            var handler = new SuperAdminAuthorizationHandler(_mockLogger.Object);
            
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "superadmin"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, "TestAuth"));

            var requirements = new IAuthorizationRequirement[]
            {
                new DenyAnonymousAuthorizationRequirement()
            };

            var context = new AuthorizationHandlerContext(requirements, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert - Verify logging was called (simplified check)
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("SuperAdmin bypass")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        #endregion
    }
}
