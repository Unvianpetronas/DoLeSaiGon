package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.DashboardStatsDTO;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.OrderRepository;
import com.example.Doanlesg.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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

    /**
     * Calculates all statistics for the dashboard in a single, efficient process.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStatistics() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalCustomers(accountRepository.countByCustomerIsNotNull());

        // ✅ FIX: This logic now safely handles multiple numeric types from the database.
        List<Object[]> revenueByCategoryData = orderRepository.getRevenueReportByCategory();
        Map<String, BigDecimal> revenueByCategory = revenueByCategoryData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Key: category name
                        row -> {                // Value: revenue
                            Object sumObject = row[1];
                            // ✅ FIX: Using modern pattern matching for instanceof.
                            if (sumObject instanceof BigDecimal bigDecimal) {
                                return bigDecimal;
                            }
                            if (sumObject instanceof Number) {
                                return new BigDecimal(sumObject.toString());
                            }
                            return BigDecimal.ZERO;
                        }
                ));
        stats.setTotalRevenueByCategory(revenueByCategory);
        stats.setTotalRevenue(revenueByCategory.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add));

        // The rest of the method remains the same...
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, DashboardStatsDTO.MonthlyChartData> monthMap = orderRepository.findAll().stream()
                .filter(order -> order.getOrderDate() != null && order.getTotalAmount() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().atZone(ZoneId.systemDefault()).format(formatter),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    DashboardStatsDTO.MonthlyChartData data = new DashboardStatsDTO.MonthlyChartData();
                                    data.setMonth(list.getFirst().getOrderDate().atZone(ZoneId.systemDefault()).format(formatter));
                                    data.setOrders(list.size());
                                    data.setRevenue(list.stream()
                                            .map(Order::getTotalAmount)
                                            .filter(Objects::nonNull)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                                    data.setCustomers(0);
                                    return data;
                                }
                        )
                ));

        List<DashboardStatsDTO.MonthlyChartData> chartData = monthMap.values().stream()
                .sorted(Comparator.comparing(DashboardStatsDTO.MonthlyChartData::getMonth))
                .collect(Collectors.toList());

        stats.setChartData(chartData);

        stats.setMonthlyRevenueMap(chartData.stream().collect(Collectors.toMap(
                DashboardStatsDTO.MonthlyChartData::getMonth,
                DashboardStatsDTO.MonthlyChartData::getRevenue
        )));

        return stats;
    }
}