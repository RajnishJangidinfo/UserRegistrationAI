using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagementApi.Data;
using UserManagementApi.DTOs;
using UserManagementApi.Models;

namespace UserManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BooksController> _logger;

        public BooksController(ApplicationDbContext context, ILogger<BooksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
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

        [HttpGet("{id}")]
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

        [HttpPost]
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

        [HttpPut("{id}")]
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

        [HttpDelete("{id}")]
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
