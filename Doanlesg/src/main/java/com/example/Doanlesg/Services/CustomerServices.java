package com.example.Doanlesg.Services;

import com.example.Doanlesg.Model.Address;
import com.example.Doanlesg.Model.User;
import com.example.Doanlesg.Repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServices {
    private CustomerRepository customerRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public CustomerServices(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createCustomer(User customer) {
        customer.setPasswordHash(passwordEncoder.encode(customer.getPasswordHash()));
        if (customer.getAddresses() != null && customer.getAddresses().size() > 0) {
            for (Address address : customer.getAddresses()) {
                address.setCustomer(customer);
            }
        } else {
            customer.setAddresses(new ArrayList<>());
        }
        return customerRepository.save(customer);
    }
   public Optional<User> findById(Integer id) {
        return customerRepository.findById(id);
   }

    public List<User> getByLastName(String LastName) {
        return customerRepository.findCustomerByLastName(LastName);
    }

    public Optional<User> updateCustomer(Integer id, User customerDetails) {
        return customerRepository.findById(id)
                .map(existingCustomer -> {
                    existingCustomer.setFullName(customerDetails.getFullName());
                    existingCustomer.setEmail(customerDetails.getEmail());
                    existingCustomer.setPhoneNumber(customerDetails.getPhoneNumber());

                    if (customerDetails.getPasswordHash() != null && !customerDetails.getPasswordHash().isEmpty()) {
                        existingCustomer.setPasswordHash(passwordEncoder.encode(customerDetails.getPasswordHash()));
                    }
                    existingCustomer.getAddresses().clear();
                    if (customerDetails.getAddresses() != null && customerDetails.getAddresses().size() > 0) {
                        for (Address address : customerDetails.getAddresses()) {
                            address.setCustomer(existingCustomer);
                            existingCustomer.getAddresses().add(address);
                        }

                    }
                    return customerRepository.save(existingCustomer);
                });
    }

    public boolean deleteCustomer(Integer id) {
        if(customerRepository.existsById(id)){
            customerRepository.deleteById(id);
            return true;
        }else {
            return false;
        }
    }

}

