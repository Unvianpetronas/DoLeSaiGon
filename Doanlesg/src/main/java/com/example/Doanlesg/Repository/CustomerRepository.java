package com.example.Doanlesg.Repository;

import com.example.Doanlesg.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CustomerRepository extends JpaRepository<User, Integer> {
    @Query("SELECT c FROM User c WHERE c.fullName LIKE CONCAT('%', :lastName)")
    List<User> findCustomerByLastName(@Param("lastName") String lastName);

    //Optional<Customer> findById(Integer id); // expect zero or one customer
}
