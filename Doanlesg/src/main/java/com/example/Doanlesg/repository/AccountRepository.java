package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    boolean existsByEmail(String email);
    Optional<Account> findByEmail(String email);

    long countByCustomerIsNotNull();

    @Query("SELECT YEAR(a.createdAt) as year, MONTH(a.createdAt) as month, COUNT(a.id) as customerCount " +
           "FROM Account a WHERE a.customer IS NOT NULL " +
           "GROUP BY YEAR(a.createdAt), MONTH(a.createdAt) " +
           "ORDER BY year ASC, month ASC")
    List<Object[]> getMonthlyCustomerStats();
}
