// File: src/main/java/com/example/Doanlesg/dto/AccountDisplayDTO.java
package com.example.Doanlesg.dto;

import com.example.Doanlesg.model.Account;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data // Lombok for getters/setters
public class AccountDisplayDTO {
    private Long id;
    private String email;
    private boolean status;
    private LocalDateTime createdAt;
    private String fullName;
    private String phoneNumber;
    private List<String> roles = new ArrayList<>();

    // A helper method to safely convert an Account entity to this DTO
    public static AccountDisplayDTO fromEntity(Account account) {
        AccountDisplayDTO dto = new AccountDisplayDTO();
        dto.setId(account.getId());
        dto.setEmail(account.getEmail());
        dto.setStatus(account.isStatus());
        dto.setCreatedAt(account.getCreatedAt());

        if (account.getAdmin() != null) {
            dto.getRoles().add("ROLE_ADMIN");
            dto.setFullName(account.getAdmin().getFullName());
            dto.setPhoneNumber(account.getAdmin().getPhoneNumber());
        }
        if (account.getStaff() != null) {
            dto.getRoles().add("ROLE_STAFF");
            dto.setFullName(account.getStaff().getFullName());
            dto.setPhoneNumber(account.getStaff().getPhoneNumber());
        }
        if (account.getCustomer() != null) {
            dto.getRoles().add("ROLE_CUSTOMER");
            dto.setFullName(account.getCustomer().getFullName());
            dto.setPhoneNumber(account.getCustomer().getPhoneNumber());
        }
        return dto;
    }
}