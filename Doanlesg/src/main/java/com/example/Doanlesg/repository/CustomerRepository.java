package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer,Long> {

  /*@Query("SELECT CUS FROM Customer CUS WHERE CUS. = :id")
    Customer CheckExistCustomerInTable(@Param("id") Long id);  */
}
