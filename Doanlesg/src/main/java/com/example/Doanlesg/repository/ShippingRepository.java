package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingRepository extends JpaRepository<ShippingMethod,Long> {

}
