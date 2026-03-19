package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByCode(String code);

    @Transactional
    @Modifying
    @Query("update Order o set o.code = 'Paid' where upper(o.code) = upper(?1)")
    void updateState(@NonNull String code);

    @Transactional
    @Modifying
    @Query("delete from Order o where upper(o.code) = upper(?1)")
    void deleteOrderByCode(@NonNull String code);

    List<Order> findAllByAccountIdOrderByOrderDateDesc(Long accountId);

    List<Order> findAllByOrderByOrderDateDesc();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus <> 'Cancel'")
    long countValidOrders();

    @Query("SELECT YEAR(o.orderDate) as year, MONTH(o.orderDate) as month, COUNT(o.id) as orderCount, SUM(o.totalAmount) as totalRevenue " +
           "FROM Order o WHERE o.orderStatus <> 'Cancel' " +
           "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
           "ORDER BY year ASC, month ASC")
    List<Object[]> getMonthlyOrderStats();

    @Query("SELECT c.categoryName, SUM(oi.total) " +
           "FROM Order o JOIN o.orderItems oi JOIN oi.product p JOIN p.category c " +
           "WHERE o.orderStatus <> 'Cancel' " +
           "GROUP BY c.categoryName")
    List<Object[]> getRevenueReportByCategory();

    @Query("SELECT p.category.categoryName, SUM(oi.total) " +
            "FROM Order o " +
            "JOIN o.orderItems oi " +
            "JOIN oi.product p " +
            "JOIN p.category c " +
            "WHERE o.orderDate >= ?1 AND o.orderDate < ?2 " +
            "GROUP BY c.categoryName")
    List<Object[]> getRevenueByCategoryForMonth(java.time.Instant startInclusive, java.time.Instant endExclusive);

}
