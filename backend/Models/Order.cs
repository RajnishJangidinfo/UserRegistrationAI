using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UserManagementApi.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public required string CustomerName { get; set; }
        
        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public required string CustomerEmail { get; set; }
        
        [Required]
        [MaxLength(20)]
        public required string CustomerPhone { get; set; }
        
        public decimal TotalPrice { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
