using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagementApi.Data;
using UserManagementApi.DTOs;
using UserManagementApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace UserManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BooksController> _logger;
        private readonly IWebHostEnvironment _env;

        public BooksController(ApplicationDbContext context, ILogger<BooksController> logger, IWebHostEnvironment env)
        {
            _context = context;
            _logger = logger;
            _env = env;
        }

        // Image upload endpoint
        // Admin or SuperAdmin only - upload images
        [HttpPost("upload-image")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<string>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Invalid file type. Only image files are allowed.");

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit.");

            try
            {
                // Create uploads directory if it doesn't exist
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "books");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Return the relative path to store in database
                var relativePath = $"/uploads/books/{uniqueFileName}";
                return Ok(new { path = relativePath });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, "Error uploading file");
            }
        }

        // Public - anyone can view books
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
        {
            var books = await _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    GoogleBookId = b.GoogleBookId,
                    Title = b.Title,
                    Subtitle = b.Subtitle,
                    Publisher = b.Publisher,
                    PublishedDate = b.PublishedDate,
                    Description = b.Description,
                    PageCount = b.PageCount,
                    PrintType = b.PrintType,
                    Language = b.Language,
                    ThumbnailUrl = b.ThumbnailUrl,
                    InfoLink = b.InfoLink,
                    StockQuantity = b.StockQuantity,
                    UnitPrice = b.UnitPrice,
                    AuthorNames = b.Authors.Select(a => a.Name).ToList(),
                    CategoryNames = b.Categories.Select(c => c.Name).ToList()
                })
                .ToListAsync();

            return Ok(books);
        }

        // Public - anyone can view book details
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var b = await _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (b == null) return NotFound();

            return new BookDto
            {
                Id = b.Id,
                GoogleBookId = b.GoogleBookId,
                Title = b.Title,
                Subtitle = b.Subtitle,
                Publisher = b.Publisher,
                PublishedDate = b.PublishedDate,
                Description = b.Description,
                PageCount = b.PageCount,
                PrintType = b.PrintType,
                Language = b.Language,
                ThumbnailUrl = b.ThumbnailUrl,
                InfoLink = b.InfoLink,
                StockQuantity = b.StockQuantity,
                UnitPrice = b.UnitPrice,
                AuthorNames = b.Authors.Select(a => a.Name).ToList(),
                CategoryNames = b.Categories.Select(c => c.Name).ToList()
            };
        }

        // Admin or SuperAdmin only - create books
        [HttpPost]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<BookDto>> CreateBook(CreateBookDto dto)
        {
            var book = new Book
            {
                GoogleBookId = dto.GoogleBookId,
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                Publisher = dto.Publisher,
                PublishedDate = dto.PublishedDate,
                Description = dto.Description,
                PageCount = dto.PageCount,
                PrintType = dto.PrintType,
                Language = dto.Language,
                ThumbnailUrl = dto.ThumbnailUrl,
                InfoLink = dto.InfoLink,
                StockQuantity = dto.StockQuantity,
                UnitPrice = dto.UnitPrice
            };

            foreach (var authorName in dto.AuthorNames)
            {
                var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == authorName);
                if (author == null)
                {
                    author = new Author { Name = authorName };
                    _context.Authors.Add(author);
                }
                book.Authors.Add(author);
            }

            foreach (var catName in dto.CategoryNames)
            {
                var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == catName);
                if (category == null)
                {
                    category = new Category { Name = catName };
                    _context.Categories.Add(category);
                }
                book.Categories.Add(category);
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, new BookDto
            {
                Id = book.Id,
                GoogleBookId = book.GoogleBookId,
                Title = book.Title,
                Subtitle = book.Subtitle,
                Publisher = book.Publisher,
                PublishedDate = book.PublishedDate,
                Description = book.Description,
                PageCount = book.PageCount,
                PrintType = book.PrintType,
                Language = book.Language,
                ThumbnailUrl = book.ThumbnailUrl,
                InfoLink = book.InfoLink,
                StockQuantity = book.StockQuantity,
                UnitPrice = book.UnitPrice,
                AuthorNames = book.Authors.Select(a => a.Name).ToList(),
                CategoryNames = book.Categories.Select(c => c.Name).ToList()
            });
        }

        // Admin or SuperAdmin only - update books
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> UpdateBook(int id, CreateBookDto dto)
        {
            var book = await _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (book == null) return NotFound();

            book.Title = dto.Title;
            book.Subtitle = dto.Subtitle;
            book.Publisher = dto.Publisher;
            book.PublishedDate = dto.PublishedDate;
            book.Description = dto.Description;
            book.PageCount = dto.PageCount;
            book.PrintType = dto.PrintType;
            book.Language = dto.Language;
            book.ThumbnailUrl = dto.ThumbnailUrl;
            book.InfoLink = dto.InfoLink;
            book.StockQuantity = dto.StockQuantity;
            book.UnitPrice = dto.UnitPrice;

            // Simple clear and rebuild relation for demo (inefficient but works for small sets)
            book.Authors.Clear();
            foreach (var authorName in dto.AuthorNames)
            {
                var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == authorName);
                if (author == null)
                {
                    author = new Author { Name = authorName };
                    _context.Authors.Add(author);
                }
                book.Authors.Add(author);
            }

            book.Categories.Clear();
            foreach (var catName in dto.CategoryNames)
            {
                var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == catName);
                if (category == null)
                {
                    category = new Category { Name = catName };
                    _context.Categories.Add(category);
                }
                book.Categories.Add(category);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Admin or SuperAdmin only - delete books
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
