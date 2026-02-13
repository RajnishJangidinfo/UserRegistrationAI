using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using UserManagementApi.Controllers;
using UserManagementApi.Data;
using UserManagementApi.Models;
using UserManagementApi.DTOs;
using Microsoft.AspNetCore.Http;
using System.Text;

namespace UserManagementApi.Tests.Controllers
{
    public class BooksControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly BooksController _controller;
        private readonly Mock<ILogger<BooksController>> _mockLogger;
        private readonly Mock<IWebHostEnvironment> _mockEnv;

        public BooksControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            
            // Setup mocks
            _mockLogger = new Mock<ILogger<BooksController>>();
            _mockEnv = new Mock<IWebHostEnvironment>();
            _mockEnv.Setup(env => env.ContentRootPath).Returns(Path.GetTempPath());

            // Create controller
            _controller = new BooksController(_context, _mockLogger.Object, _mockEnv.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region GetBooks Tests

        [Fact]
        public async Task GetBooks_ReturnsEmptyList_WhenNoBooksExist()
        {
            // Act
            var result = await _controller.GetBooks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var books = Assert.IsAssignableFrom<IEnumerable<BookDto>>(okResult.Value);
            Assert.Empty(books);
        }

        [Fact]
        public async Task GetBooks_ReturnsAllBooks_WhenBooksExist()
        {
            // Arrange
            var author = new Author { Name = "Test Author" };
            var category = new Category { Name = "Fiction" };
            
            var book1 = new Book
            {
                Title = "Book 1",
                UnitPrice = 19.99m,
                StockQuantity = 10,
                Authors = new List<Author> { author },
                Categories = new List<Category> { category }
            };

            var book2 = new Book
            {
                Title = "Book 2",
                UnitPrice = 29.99m,
                StockQuantity = 5
            };

            _context.Books.AddRange(book1, book2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBooks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var books = Assert.IsAssignableFrom<IEnumerable<BookDto>>(okResult.Value);
            Assert.Equal(2, books.Count());
        }

        #endregion

        #region GetBook Tests

        [Fact]
        public async Task GetBook_ReturnsBook_WhenBookExists()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                UnitPrice = 19.99m,
                StockQuantity = 10
            };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBook(book.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<BookDto>>(result);
            var bookDto = Assert.IsType<BookDto>(actionResult.Value);
            Assert.Equal("Test Book", bookDto.Title);
            Assert.Equal(19.99m, bookDto.UnitPrice);
        }

        [Fact]
        public async Task GetBook_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Act
            var result = await _controller.GetBook(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        #endregion

        #region CreateBook Tests

        [Fact]
        public async Task CreateBook_CreatesBook_WithValidData()
        {
            // Arrange
            var createDto = new CreateBookDto
            {
                Title = "New Book",
                Description = "Test Description",
                UnitPrice = 24.99m,
                StockQuantity = 15,
                PageCount = 300,
                AuthorNames = new List<string> { "Author 1" },
                CategoryNames = new List<string> { "Category 1" }
            };

            // Act
            var result = await _controller.CreateBook(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var bookDto = Assert.IsType<BookDto>(createdResult.Value);
            
            Assert.Equal("New Book", bookDto.Title);
            Assert.Equal(24.99m, bookDto.UnitPrice);
            Assert.Single(bookDto.AuthorNames);
            Assert.Contains("Author 1", bookDto.AuthorNames);
        }

        [Fact]
        public async Task CreateBook_CreatesAuthorsAndCategories_WhenTheyDontExist()
        {
            // Arrange
            var createDto = new CreateBookDto
            {
                Title = "Book with New Entities",
                UnitPrice = 19.99m,
                StockQuantity = 10,
                PageCount = 200,
                AuthorNames = new List<string> { "New Author" },
                CategoryNames = new List<string> { "New Category" }
            };

            // Act
            await _controller.CreateBook(createDto);

            // Assert
            var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == "New Author");
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == "New Category");
            
            Assert.NotNull(author);
            Assert.NotNull(category);
        }

        [Fact]
        public async Task CreateBook_UsesExistingAuthorsAndCategories_WhenTheyExist()
        {
            // Arrange
            var existingAuthor = new Author { Name = "Existing Author" };
            var existingCategory = new Category { Name = "Existing Category" };
            _context.Authors.Add(existingAuthor);
            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            var initialAuthorId = existingAuthor.Id;
            var initialCategoryId = existingCategory.Id;

            var createDto = new CreateBookDto
            {
                Title = "Book with Existing Entities",
                UnitPrice = 19.99m,
                StockQuantity = 10,
                PageCount = 200,
                AuthorNames = new List<string> { "Existing Author" },
                CategoryNames = new List<string> { "Existing Category" }
            };

            // Act
            await _controller.CreateBook(createDto);

            // Assert
            var authorCount = await _context.Authors.CountAsync(a => a.Name == "Existing Author");
            var categoryCount = await _context.Categories.CountAsync(c => c.Name == "Existing Category");
            
            Assert.Equal(1, authorCount);
            Assert.Equal(1, categoryCount);
        }

        #endregion

        #region UpdateBook Tests

        [Fact]
        public async Task UpdateBook_UpdatesBook_WhenBookExists()
        {
            // Arrange
            var book = new Book
            {
                Title = "Original Title",
                UnitPrice = 19.99m,
                StockQuantity = 10,
                PageCount = 200
            };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var updateDto = new CreateBookDto
            {
                Title = "Updated Title",
                UnitPrice = 29.99m,
                StockQuantity = 20,
                PageCount = 250,
                AuthorNames = new List<string> { "Updated Author" },
                CategoryNames = new List<string> { "Updated Category" }
            };

            // Act
            var result = await _controller.UpdateBook(book.Id, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            var updatedBook = await _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .FirstOrDefaultAsync(b => b.Id == book.Id);
            
            Assert.Equal("Updated Title", updatedBook!.Title);
            Assert.Equal(29.99m, updatedBook.UnitPrice);
            Assert.Single(updatedBook.Authors);
        }

        [Fact]
        public async Task UpdateBook_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Arrange
            var updateDto = new CreateBookDto
            {
                Title = "Non-existent Book",
                UnitPrice = 19.99m,
                StockQuantity = 10,
                PageCount = 200,
                AuthorNames = new List<string> { "Author" },
                CategoryNames = new List<string> { "Category" }
            };

            // Act
            var result = await _controller.UpdateBook(999, updateDto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region DeleteBook Tests

        [Fact]
        public async Task DeleteBook_DeletesBook_WhenBookExists()
        {
            // Arrange
            var book = new Book
            {
                Title = "Book to Delete",
                UnitPrice = 19.99m,
                StockQuantity = 10
            };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            var bookId = book.Id;

            // Act
            var result = await _controller.DeleteBook(bookId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            var deletedBook = await _context.Books.FindAsync(bookId);
            Assert.Null(deletedBook);
        }

        [Fact]
        public async Task DeleteBook_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Act
            var result = await _controller.DeleteBook(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region UploadImage Tests

        [Fact]
        public async Task UploadImage_ReturnsOk_WithValidImageFile()
        {
            // Arrange
            var content = "fake image content";
            var fileName = "test.jpg";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            var file = new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            // Act
            var result = await _controller.UploadImage(file);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenFileIsNull()
        {
            // Act
            var result = await _controller.UploadImage(null!);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No file uploaded", badRequestResult.Value);
        }

        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenFileIsEmpty()
        {
            // Arrange
            var stream = new MemoryStream();
            var file = new FormFile(stream, 0, 0, "file", "test.jpg");

            // Act
            var result = await _controller.UploadImage(file);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No file uploaded", badRequestResult.Value);
        }

        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenFileTypeIsInvalid()
        {
            // Arrange
            var content = "fake content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            var file = new FormFile(stream, 0, stream.Length, "file", "test.txt")
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };

            // Act
            var result = await _controller.UploadImage(file);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Invalid file type", badRequestResult.Value?.ToString());
        }

        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenFileSizeExceedsLimit()
        {
            // Arrange
            var content = new byte[6 * 1024 * 1024]; // 6MB
            var stream = new MemoryStream(content);
            var file = new FormFile(stream, 0, stream.Length, "file", "test.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            // Act
            var result = await _controller.UploadImage(file);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("size exceeds", badRequestResult.Value?.ToString());
        }

        #endregion
    }
}
