package com.example.Doanlesg.Repository;

import com.example.Doanlesg.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    @Query("SELECT c FROM Customer c WHERE c.fullName LIKE CONCAT('%', :lastName)")
    List<Customer> findCustomerByLastName(@Param("lastName") String lastName);

    //Optional<Customer> findById(Integer id); // expect zero or one customer
}
