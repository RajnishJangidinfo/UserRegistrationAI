namespace UserManagementApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string Role { get; set; } = "USER";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
