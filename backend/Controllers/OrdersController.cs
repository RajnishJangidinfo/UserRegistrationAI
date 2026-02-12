using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagementApi.Data;
using UserManagementApi.DTOs;
using UserManagementApi.Models;

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

        [HttpGet]
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

        [HttpPost]
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
    }
}
