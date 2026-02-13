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
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(ApplicationDbContext context, ILogger<OrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Admin or SuperAdmin only - view all orders
        [HttpGet]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    CustomerPhone = o.CustomerPhone,
                    TotalPrice = o.TotalPrice,
                    OrderDate = o.OrderDate,
                    Items = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        BookId = oi.BookId,
                        BookTitle = oi.Book != null ? oi.Book.Title : "Unknown Book",
                        ThumbnailUrl = oi.Book != null ? oi.Book.ThumbnailUrl : null,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // Customer or above - place orders
        [HttpPost]
        [Authorize(Policy = "CustomerOrAbove")]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest("Order must contain at least one item.");
            }

            var order = new Order
            {
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                OrderDate = DateTime.UtcNow,
                TotalPrice = 0
            };

            foreach (var itemDto in dto.Items)
            {
                var book = await _context.Books.FindAsync(itemDto.BookId);
                if (book == null)
                {
                    return NotFound($"Book with ID {itemDto.BookId} not found.");
                }

                if (book.StockQuantity < itemDto.Quantity)
                {
                    return BadRequest($"Insufficient stock for book: {book.Title}.");
                }

                var orderItem = new OrderItem
                {
                    BookId = itemDto.BookId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = book.UnitPrice
                };

                order.OrderItems.Add(orderItem);
                order.TotalPrice += book.UnitPrice * itemDto.Quantity;

                // Update stock
                book.StockQuantity -= itemDto.Quantity;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Prepare response DTO
            var resultDto = new OrderDto
            {
                Id = order.Id,
                CustomerName = order.CustomerName,
                CustomerEmail = order.CustomerEmail,
                CustomerPhone = order.CustomerPhone,
                TotalPrice = order.TotalPrice,
                OrderDate = order.OrderDate,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    BookId = oi.BookId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    BookTitle = _context.Books.Find(oi.BookId)?.Title
                }).ToList()
            };

            return Ok(resultDto);
        }

        // Analytics Endpoints - Admin or SuperAdmin only
        [HttpGet("analytics/weekly")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<OrderStatisticsDto>> GetWeeklyAnalytics()
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-7);
            return await GetAnalytics(startDate, DateTime.UtcNow);
        }

        [HttpGet("analytics/monthly")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<OrderStatisticsDto>> GetMonthlyAnalytics()
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-30);
            return await GetAnalytics(startDate, DateTime.UtcNow);
        }

        [HttpGet("analytics/annual")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<ActionResult<OrderStatisticsDto>> GetAnnualAnalytics()
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-365);
            return await GetAnalytics(startDate, DateTime.UtcNow);
        }

        private async Task<ActionResult<OrderStatisticsDto>> GetAnalytics(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .ToListAsync();

            var totalOrders = orders.Count;
            var totalRevenue = orders.Sum(o => o.TotalPrice);
            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Calculate growth percentage (compare with previous period)
            var periodDays = (endDate - startDate).Days;
            var previousStartDate = startDate.AddDays(-periodDays);
            var previousOrders = await _context.Orders
                .Where(o => o.OrderDate >= previousStartDate && o.OrderDate < startDate)
                .ToListAsync();

            var previousRevenue = previousOrders.Sum(o => o.TotalPrice);
            var growthPercentage = previousRevenue > 0 
                ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
                : 0;

            // Group orders by date
            var dailyData = orders
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailyOrderData
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    OrderCount = g.Count(),
                    Revenue = g.Sum(o => o.TotalPrice)
                })
                .OrderBy(d => d.Date)
                .ToList();

            var statistics = new OrderStatisticsDto
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                AverageOrderValue = averageOrderValue,
                GrowthPercentage = growthPercentage,
                DailyData = dailyData
            };

            return Ok(statistics);
        }
    }
}
