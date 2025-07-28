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

        // Giả sử trạng thái hủy là OrderStatus.CANCELLED
        // Lấy danh sách các đơn hàng CHƯA BỊ HỦY để tính toán
        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(order -> order.getOrderStatus() != null && !order.getOrderStatus().equals("Cancel"))
                .collect(Collectors.toList());

        stats.setTotalProducts(productRepository.count());
        // 1. ✅ Đếm trên danh sách đơn hàng đã lọc
        stats.setTotalOrders(validOrders.size());
        stats.setTotalCustomers(accountRepository.countByCustomerIsNotNull());

        // 2. ✅ Tính toán doanh thu theo danh mục từ danh sách đã lọc
        // Cách này đảm bảo chỉ các đơn hàng hợp lệ được tính
        Map<String, BigDecimal> revenueByCategory = validOrders.stream()
                .flatMap(order -> order.getOrderItems().stream()) // Lấy tất cả các order items
                .filter(item -> item.getProduct() != null && item.getProduct().getCategory() != null)
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getCategory().getCategoryName(), // Nhóm theo tên category
                        Collectors.mapping(
                                item -> item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())), // Tính giá trị của item
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add) // Cộng dồn lại
                        )
                ));
        stats.setTotalRevenueByCategory(revenueByCategory);


        // 3. ✅ Tính toán doanh thu theo tháng từ danh sách đã lọc
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, DashboardStatsDTO.MonthlyChartData> monthMap = validOrders.stream()
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

        // Tính tổng doanh thu từ chartData đã được lọc
        BigDecimal totalRevenue = chartData.stream()
                .map(DashboardStatsDTO.MonthlyChartData::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

        stats.setMonthlyRevenueMap(chartData.stream().collect(Collectors.toMap(
                DashboardStatsDTO.MonthlyChartData::getMonth,
                DashboardStatsDTO.MonthlyChartData::getRevenue
        )));

        return stats;
    }
}