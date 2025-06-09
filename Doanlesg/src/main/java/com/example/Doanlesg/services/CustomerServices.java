package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Customer;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomerServices {
    private AccountRepository accountRepository;
    private CustomerRepository customerRepository;

    @Autowired
    public CustomerServices(AccountRepository accountRepository, CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }
 /* public int checkIfIsCustomer(Long id){
      Customer customercheck = customerRepository.CheckExistCustomerInTable(id);
      if(customercheck == null || customercheck.getId() == null){
          return 0;
      }
      return 1;
  }
*/
}
