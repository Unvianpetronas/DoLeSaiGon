package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
