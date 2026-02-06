namespace UserManagementApi.DTOs
{
    public class AuthorDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }

    public class BookDto
    {
        public int Id { get; set; }
        public string? GoogleBookId { get; set; }
        public required string Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Publisher { get; set; }
        public string? PublishedDate { get; set; }
        public string? Description { get; set; }
        public int PageCount { get; set; }
        public string? PrintType { get; set; }
        public string? Language { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? InfoLink { get; set; }
        
        public List<string> AuthorNames { get; set; } = new();
        public List<string> CategoryNames { get; set; } = new();
    }

    public class CreateBookDto
    {
        public string? GoogleBookId { get; set; }
        public required string Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Publisher { get; set; }
        public string? PublishedDate { get; set; }
        public string? Description { get; set; }
        public int PageCount { get; set; }
        public string? PrintType { get; set; }
        public string? Language { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? InfoLink { get; set; }
        
        public List<string> AuthorNames { get; set; } = new();
        public List<string> CategoryNames { get; set; } = new();
    }
}
