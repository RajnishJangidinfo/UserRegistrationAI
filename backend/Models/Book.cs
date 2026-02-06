namespace UserManagementApi.Models
{
    public class Book
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
        
        public ICollection<Author> Authors { get; set; } = new List<Author>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
    }
}
