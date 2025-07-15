package com.example.Doanlesg.dto;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Staff;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountStaffDTO {
    private Account account;
    private Staff staff;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String employeeId;
    private String department;

    // Getters and setters
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
    public Staff getStaff() { return staff; }
    public void setStaff(Staff staff) { this.staff = staff; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public static AccountStaffDTO fromEntity(Account account) {
        AccountStaffDTO dto = new AccountStaffDTO();
        dto.setAccount(account);

        dto.setEmail(account.getEmail());
        dto.setFullName(account.getFullName());
        dto.setPhoneNumber(account.getPhoneNumber());
        if (account.getStaff() != null) {
            dto.setEmployeeId(account.getStaff().getEmployeeId());
            dto.setDepartment(account.getStaff().getDepartment());
        } else {
            return new AccountStaffDTO();
        }
        dto.setPassword("*************************");
        account.setPasswordHash("****************");

        if (account.getStaff() != null) {
            dto.setStaff(account.getStaff());
            dto.setFullName(account.getStaff().getFullName());
            dto.setPhoneNumber(account.getStaff().getPhoneNumber());
        }
        return dto;
    }

}

