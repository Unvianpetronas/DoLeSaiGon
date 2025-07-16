package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VourcherRepository extends JpaRepository<Voucher,Long> {
}
