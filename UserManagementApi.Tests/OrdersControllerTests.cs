using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UserManagementApi.Controllers;
using UserManagementApi.Data;
using UserManagementApi.Models;
using UserManagementApi.DTOs;

namespace UserManagementApi.Tests.Controllers
{
    public class OrdersControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly OrdersController _controller;
        private readonly Mock<ILogger<OrdersController>> _mockLogger;

        public OrdersControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            
            // Setup mocks
            _mockLogger = new Mock<ILogger<OrdersController>>();

            // Create controller
            _controller = new OrdersController(_context, _mockLogger.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region GetOrders Tests

        [Fact]
        public async Task GetOrders_ReturnsEmptyList_WhenNoOrdersExist()
        {
            // Act
            var result = await _controller.GetOrders();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var orders = Assert.IsAssignableFrom<IEnumerable<OrderDto>>(okResult.Value);
            Assert.Empty(orders);
        }

        [Fact]
        public async Task GetOrders_ReturnsAllOrders_WhenOrdersExist()
        {
            // Arrange
            var book = new Book { Title = "Test Book", UnitPrice = 10.00m, StockQuantity = 100 };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var order1 = new Order
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                TotalPrice = 20.00m,
                OrderDate = DateTime.UtcNow
            };

            var order2 = new Order
            {
                CustomerName = "Jane Doe",
                CustomerEmail = "jane@example.com",
                CustomerPhone = "0987654321",
                TotalPrice = 30.00m,
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.AddRange(order1, order2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetOrders();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var orders = Assert.IsAssignableFrom<IEnumerable<OrderDto>>(okResult.Value);
            Assert.Equal(2, orders.Count());
        }

        #endregion

        #region CreateOrder Tests

        [Fact]
        public async Task CreateOrder_CreatesOrder_WithValidData()
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

            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = book.Id, Quantity = 2 }
                }
            };

            // Act
            var result = await _controller.CreateOrder(createDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var orderDto = Assert.IsType<OrderDto>(okResult.Value);
            Assert.Equal("John Doe", orderDto.CustomerName);
            Assert.Equal(39.98m, orderDto.TotalPrice); // 19.99 * 2
            Assert.Single(orderDto.Items);
        }

        [Fact]
        public async Task CreateOrder_UpdatesBookStock_AfterOrderIsPlaced()
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

            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = book.Id, Quantity = 3 }
                }
            };

            // Act
            await _controller.CreateOrder(createDto);

            // Assert
            var updatedBook = await _context.Books.FindAsync(book.Id);
            Assert.Equal(7, updatedBook!.StockQuantity); // 10 - 3
        }

        [Fact]
        public async Task CreateOrder_ReturnsBadRequest_WhenInsufficientStock()
        {
            // Arrange
            var book = new Book 
            { 
                Title = "Test Book", 
                UnitPrice = 19.99m, 
                StockQuantity = 2 
            };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = book.Id, Quantity = 5 }
                }
            };

            // Act
            var result = await _controller.CreateOrder(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Insufficient stock", badRequestResult.Value?.ToString());
        }

        [Fact]
        public async Task CreateOrder_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Arrange
            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = 999, Quantity = 1 }
                }
            };

            // Act
            var result = await _controller.CreateOrder(createDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("Book with ID 999 not found", notFoundResult.Value?.ToString());
        }

        [Fact]
        public async Task CreateOrder_ReturnsBadRequest_WhenNoItems()
        {
            // Arrange
            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>()
            };

            // Act
            var result = await _controller.CreateOrder(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("at least one item", badRequestResult.Value?.ToString());
        }

        [Fact]
        public async Task CreateOrder_CalculatesTotalPrice_Correctly()
        {
            // Arrange
            var book1 = new Book { Title = "Book 1", UnitPrice = 10.00m, StockQuantity = 100 };
            var book2 = new Book { Title = "Book 2", UnitPrice = 15.50m, StockQuantity = 100 };
            _context.Books.AddRange(book1, book2);
            await _context.SaveChangesAsync();

            var createDto = new CreateOrderDto
            {
                CustomerName = "John Doe",
                CustomerEmail = "john@example.com",
                CustomerPhone = "1234567890",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { BookId = book1.Id, Quantity = 2 },
                    new CreateOrderItemDto { BookId = book2.Id, Quantity = 3 }
                }
            };

            // Act
            var result = await _controller.CreateOrder(createDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var orderDto = Assert.IsType<OrderDto>(okResult.Value);
            Assert.Equal(66.50m, orderDto.TotalPrice); // (10*2) + (15.50*3) = 20 + 46.50
        }

        #endregion

        #region Analytics Tests

        [Fact]
        public async Task GetWeeklyAnalytics_ReturnsCorrectStatistics()
        {
            // Arrange
            var order1 = new Order
            {
                CustomerName = "John",
                CustomerEmail = "john@example.com",
                CustomerPhone = "123",
                TotalPrice = 100m,
                OrderDate = DateTime.UtcNow.AddDays(-2)
            };

            var order2 = new Order
            {
                CustomerName = "Jane",
                CustomerEmail = "jane@example.com",
                CustomerPhone = "456",
                TotalPrice = 200m,
                OrderDate = DateTime.UtcNow.AddDays(-3)
            };

            _context.Orders.AddRange(order1, order2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWeeklyAnalytics();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var stats = Assert.IsType<OrderStatisticsDto>(okResult.Value);
            Assert.Equal(2, stats.TotalOrders);
            Assert.Equal(300m, stats.TotalRevenue);
            Assert.Equal(150m, stats.AverageOrderValue);
        }

        [Fact]
        public async Task GetMonthlyAnalytics_ReturnsOnlyOrdersInRange()
        {
            // Arrange
            var recentOrder = new Order
            {
                CustomerName = "John",
                CustomerEmail = "john@example.com",
                CustomerPhone = "123",
                TotalPrice = 100m,
                OrderDate = DateTime.UtcNow.AddDays(-15)
            };

            var oldOrder = new Order
            {
                CustomerName = "Jane",
                CustomerEmail = "jane@example.com",
                CustomerPhone = "456",
                TotalPrice = 200m,
                OrderDate = DateTime.UtcNow.AddDays(-45) // Outside 30 day range
            };

            _context.Orders.AddRange(recentOrder, oldOrder);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMonthlyAnalytics();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var stats = Assert.IsType<OrderStatisticsDto>(okResult.Value);
            Assert.Equal(1, stats.TotalOrders);
            Assert.Equal(100m, stats.TotalRevenue);
        }

        [Fact]
        public async Task GetAnnualAnalytics_IncludesAllOrdersInYear()
        {
            // Arrange
            var order1 = new Order
            {
                CustomerName = "John",
                CustomerEmail = "john@example.com",
                CustomerPhone = "123",
                TotalPrice = 100m,
                OrderDate = DateTime.UtcNow.AddDays(-100)
            };

            var order2 = new Order
            {
                CustomerName = "Jane",
                CustomerEmail = "jane@example.com",
                CustomerPhone = "456",
                TotalPrice = 200m,
                OrderDate = DateTime.UtcNow.AddDays(-200)
            };

            _context.Orders.AddRange(order1, order2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAnnualAnalytics();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var stats = Assert.IsType<OrderStatisticsDto>(okResult.Value);
            Assert.Equal(2, stats.TotalOrders);
            Assert.Equal(300m, stats.TotalRevenue);
        }

        [Fact]
        public async Task Analytics_ReturnsZero_WhenNoOrders()
        {
            // Act
            var result = await _controller.GetWeeklyAnalytics();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var stats = Assert.IsType<OrderStatisticsDto>(okResult.Value);
            Assert.Equal(0, stats.TotalOrders);
            Assert.Equal(0m, stats.TotalRevenue);
            Assert.Equal(0m, stats.AverageOrderValue);
        }

        #endregion
    }
}
