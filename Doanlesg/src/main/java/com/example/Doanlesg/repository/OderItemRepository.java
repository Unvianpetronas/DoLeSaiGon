package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OderItemRepository extends JpaRepository<OrderItem,Long> {
}
