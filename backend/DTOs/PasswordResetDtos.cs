namespace UserManagementApi.DTOs
{
    public class ForgotPasswordDto
    {
        public required string Email { get; set; }
    }

    public class ResetPasswordDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
        public required string NewPassword { get; set; }
    }
}
