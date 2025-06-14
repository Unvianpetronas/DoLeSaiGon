package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    public CartItem findByCartIdAndProductId(Long cartId, Long productId);
}
