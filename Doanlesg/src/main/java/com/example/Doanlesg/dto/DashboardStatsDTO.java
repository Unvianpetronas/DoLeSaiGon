package com.example.Doanlesg.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * A DTO to hold all calculated statistics for the admin dashboard.
 */
@Data
public class DashboardStatsDTO {
    private long totalProducts;
    private long totalOrders;
    private long totalCustomers;
    private BigDecimal totalRevenue;
    private Map<String, BigDecimal> monthlyRevenueMap;
    private Map<String, BigDecimal> totalRevenueByCategory;
    private List<MonthlyChartData> chartData;

    @Data
    public static class MonthlyChartData {
        private String month;
        private long orders;
        private BigDecimal revenue;
        private long customers;
    }
}