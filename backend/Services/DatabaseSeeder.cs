using UserManagementApi.Data;
using UserManagementApi.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace UserManagementApi.Services
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                // Ensure database is created
                await _context.Database.EnsureCreatedAsync();

                // Seed SuperAdmin user
                if (!await _context.Users.AnyAsync(u => u.Email == "admin@example.com"))
                {
                    var superAdmin = new User
                    {
                        Username = "superadmin",
                        Email = "admin@example.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Role = "SuperAdmin",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(superAdmin);
                    _logger.LogInformation("✅ Created SuperAdmin user: admin@example.com");
                }

                // Seed Admin user
                if (!await _context.Users.AnyAsync(u => u.Email == "manager@example.com"))
                {
                    var admin = new User
                    {
                        Username = "manager",
                        Email = "manager@example.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Role = "Admin",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(admin);
                    _logger.LogInformation("✅ Created Admin user: manager@example.com");
                }

                // Seed Customer user
                if (!await _context.Users.AnyAsync(u => u.Email == "user@example.com"))
                {
                    var customer = new User
                    {
                        Username = "customer",
                        Email = "user@example.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        Role = "Customer",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(customer);
                    _logger.LogInformation("✅ Created Customer user: user@example.com");
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("🎉 Database seeding completed successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during database seeding");
                throw;
            }
        }
    }
}
