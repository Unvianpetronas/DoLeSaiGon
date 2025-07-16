package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentMethod,Long> {
}
