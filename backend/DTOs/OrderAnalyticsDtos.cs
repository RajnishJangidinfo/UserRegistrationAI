namespace UserManagementApi.DTOs
{
    public class OrderStatisticsDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal GrowthPercentage { get; set; }
        public List<DailyOrderData> DailyData { get; set; } = new List<DailyOrderData>();
    }

    public class DailyOrderData
    {
        public string Date { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
