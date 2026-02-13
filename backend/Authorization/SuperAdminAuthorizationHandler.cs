using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace UserManagementApi.Authorization
{
    /// <summary>
    /// Authorization handler that allows SuperAdmin to bypass all authorization requirements.
    /// When a user has the "SuperAdmin" role, this handler will automatically succeed
    /// for ANY authorization requirement, effectively granting full system access.
    /// </summary>
    public class SuperAdminAuthorizationHandler : IAuthorizationHandler
    {
        private readonly ILogger<SuperAdminAuthorizationHandler> _logger;

        public SuperAdminAuthorizationHandler(ILogger<SuperAdminAuthorizationHandler> logger)
        {
            _logger = logger;
        }

        public Task HandleAsync(AuthorizationHandlerContext context)
        {
            // Check if the user is authenticated
            if (context.User?.Identity?.IsAuthenticated != true)
            {
                return Task.CompletedTask;
            }

            // Check if the user has the SuperAdmin role
            var isSuperAdmin = context.User.HasClaim(c => 
                c.Type == ClaimTypes.Role && c.Value == "SuperAdmin");

            if (isSuperAdmin)
            {
                // SuperAdmin bypasses ALL authorization requirements
                foreach (var requirement in context.PendingRequirements.ToList())
                {
                    context.Succeed(requirement);
                }

                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var username = context.User.FindFirst(ClaimTypes.Name)?.Value;
                
                _logger.LogInformation(
                    "🔓 SuperAdmin bypass: User {Username} (ID: {UserId}) granted access to all resources",
                    username, userId);
            }

            return Task.CompletedTask;
        }
    }
}
