package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.DashboardStatsDTO;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.OrderRepository;
import com.example.Doanlesg.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;


@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;

    public AdminService(ProductRepository productRepository, OrderRepository orderRepository, AccountRepository accountRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStatistics() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.countValidOrders());
        stats.setTotalCustomers(accountRepository.countByCustomerIsNotNull());

        Map < String, BigDecimal > revenueByCategory = new HashMap < > ();
        List < Object[] > categoryResults = orderRepository.getRevenueReportByCategory();
        for (Object[] row: categoryResults) {
            String categoryName = (String) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            revenueByCategory.put(categoryName, revenue);
        }
        stats.setTotalRevenueByCategory(revenueByCategory);

        Map < String, DashboardStatsDTO.MonthlyChartData > monthlyDataMap = new TreeMap < > ();

        List < Object[] > orderStats = orderRepository.getMonthlyOrderStats();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Object[] row: orderStats) {
            String monthKey = formatMonthKey((Integer) row[0], (Integer) row[1]);
            long orderCount = (Long) row[2];
            BigDecimal revenue = (BigDecimal) row[3];

            DashboardStatsDTO.MonthlyChartData data = new DashboardStatsDTO.MonthlyChartData();
            data.setMonth(monthKey);
            data.setOrders(orderCount);
            data.setRevenue(revenue != null ? revenue : BigDecimal.ZERO);
            data.setCustomers(0); // Sẽ được cập nhật ở bước sau

            monthlyDataMap.put(monthKey, data);
            totalRevenue = totalRevenue.add(data.getRevenue());
        }
        stats.setTotalRevenue(totalRevenue);

        List < Object[] > customerStats = accountRepository.getMonthlyCustomerStats();
        for (Object[] row: customerStats) {
            String monthKey = formatMonthKey((Integer) row[0], (Integer) row[1]);
            long customerCount = (Long) row[2];

            DashboardStatsDTO.MonthlyChartData data = monthlyDataMap.getOrDefault(monthKey, new DashboardStatsDTO.MonthlyChartData());
            data.setMonth(monthKey);
            data.setCustomers(customerCount);
            // Đề phòng tháng đó có khách tạo tài khoản nhưng không có đơn hàng
            if (data.getRevenue() == null) {
                data.setRevenue(BigDecimal.ZERO);
                data.setOrders(0);
            }
            monthlyDataMap.put(monthKey, data);
        }

        // 4. Chuyển map thành list và tính toán chỉ số tăng trưởng (MoM)
        List < DashboardStatsDTO.MonthlyChartData > chartData = new ArrayList < > (monthlyDataMap.values());
        stats.setChartData(chartData);

        Map < String, BigDecimal > monthlyRevenueMap = new HashMap < > ();
        for (DashboardStatsDTO.MonthlyChartData data: chartData) {
            monthlyRevenueMap.put(data.getMonth(), data.getRevenue());
        }
        stats.setMonthlyRevenueMap(monthlyRevenueMap);

        // Per-month category breakdown so the frontend bar gauge reacts to month selection
        Map < String, Map < String, BigDecimal >> revenueByCategoryByMonth = new HashMap < > ();
        for (DashboardStatsDTO.MonthlyChartData data: chartData) {
            String[] parts = data.getMonth().split("-");
            java.time.LocalDate monthStart = java.time.LocalDate.of(
                    Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), 1);
            java.time.Instant start = monthStart.atStartOfDay(ZoneId.of("UTC")).toInstant();
            java.time.Instant end   = monthStart.plusMonths(1).atStartOfDay(ZoneId.of("UTC")).toInstant();
            Map < String, BigDecimal > catMap = new HashMap < > ();
            for (Object[] row: orderRepository.getRevenueByCategoryForMonth(start, end)) {
                catMap.put((String) row[0], (BigDecimal) row[1]);
            }
            revenueByCategoryByMonth.put(data.getMonth(), catMap);
        }
        stats.setRevenueByCategoryByMonth(revenueByCategoryByMonth);

        calculateGrowthMetrics(stats, chartData);

        return stats;
    }

    private String formatMonthKey(Integer year, Integer month) {
        return String.format("%d-%02d", year, month);
    }

    private void calculateGrowthMetrics(DashboardStatsDTO stats, List < DashboardStatsDTO.MonthlyChartData > chartData) {
        if (chartData.size() < 2) {
            stats.setRevenueGrowth(0.0);
            stats.setOrderGrowth(0.0);
            stats.setCustomerGrowth(0.0);
            return;
        }

        DashboardStatsDTO.MonthlyChartData currentMonth = chartData.get(chartData.size() - 1);
        DashboardStatsDTO.MonthlyChartData previousMonth = chartData.get(chartData.size() - 2);
        stats.setRevenueGrowth(calculatePercentageChange(previousMonth.getRevenue(), currentMonth.getRevenue()));
        stats.setOrderGrowth(calculatePercentageChange(BigDecimal.valueOf(previousMonth.getOrders()), BigDecimal.valueOf(currentMonth.getOrders())));
        stats.setCustomerGrowth(calculatePercentageChange(BigDecimal.valueOf(previousMonth.getCustomers()), BigDecimal.valueOf(currentMonth.getCustomers())));
    }

    private Double calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal change = current.subtract(previous);
        return change.divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
    }
}