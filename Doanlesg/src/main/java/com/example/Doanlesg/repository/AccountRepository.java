package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    //Optional<Customer> findById(Integer id); // expect zero or one customer
}
