package com.example.Doanlesg.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.Doanlesg.dto.AccountDisplayDTO;
import com.example.Doanlesg.dto.AccountStaffDTO;
import com.example.Doanlesg.interal.PasswordEncoder;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.AccountRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AccountServices /* REMOVE: implements UserDetailsService */ {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    private final Cloudinary cloudinary;

    public AccountServices(AccountRepository accountRepository, PasswordEncoder passwordEncoder, Cloudinary cloudinary) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinary = cloudinary;
    }

    @Transactional
    public Account createCustomerAccount(Account accountDetail, Customer customerDetail) {
        if(!validateNewAccount(accountDetail.getEmail())){
            String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
            accountDetail.setPasswordHash(encodedPassword);
            accountDetail.setStatus(true);
            accountDetail.setCreatedAt(LocalDateTime.now());
            if(customerDetail == null){
                throw new IllegalArgumentException("Customer cannot be null");
            }
            accountDetail.setCustomer(customerDetail);
            customerDetail.setAccount(accountDetail);
            if(accountDetail.getCart() == null) {
                Cart cart = new Cart();
                cart.setAccount(accountDetail);
                accountDetail.setCart(cart);
            }
            return accountRepository.save(accountDetail);
        }
        return null;
    }

    // ... (other methods like createStaffAccount, updateCustomerAccount, etc. remain the same)
    @Transactional
    public Account createStaffAccount(AccountStaffDTO dto, MultipartFile imageFile) throws IOException {
        // 1. Validate if the email already exists
        if (accountRepository.findByEmail(dto.getEmail()).isPresent()) {
            // It's better to throw an exception that the controller can catch
            throw new IllegalArgumentException("Email đã tồn tại.");
        }

        // 2. Build the Account entity from the DTO
        Account account = new Account();
        account.setEmail(dto.getEmail());
        account.setPasswordHash(passwordEncoder.encode(dto.getPassword())); // Always encode the password
        account.setStatus(true);
        account.setCreatedAt(LocalDateTime.now());

        // 3. Build the Staff entity from the DTO
        Staff staff = new Staff();
        staff.setFullName(dto.getFullName());
        staff.setPhoneNumber(dto.getPhoneNumber());
        staff.setEmployeeId(dto.getEmployeeId()); // This will be used as the image name
        staff.setDepartment(dto.getDepartment());

        // 4. Link the entities together
        account.setStaff(staff);
        staff.setAccount(account);

        // 5. Save the account (which will also save the staff due to CascadeType.ALL)
        Account createdAccount = accountRepository.save(account);

        // 6. Upload the image to Cloudinary using the employeeId
        if (imageFile != null && !imageFile.isEmpty()) {
            var options = ObjectUtils.asMap(
                    "public_id", dto.getEmployeeId(), // Use the employeeId as the unique filename
                    "overwrite", true,
                    "resource_type", "image"
            );
            // This will throw an IOException on failure, which the controller will catch
            cloudinary.uploader().upload(imageFile.getBytes(), options);
        }

        return createdAccount;
    }

    @Transactional
    public boolean updateCustomerAccount(Long id , Account accountUpdateDetail, Customer customerUpdateDetail) {
        Account existAccount = accountRepository.existsById(id) ? accountRepository.findById(id).get() : null;
        assert existAccount != null;
        Customer customerOld = existAccount.getCustomer();
        try{
            if(customerOld == null){
                return false;
            } else if (checkEmail(accountUpdateDetail.getId(),accountUpdateDetail.getEmail())) {
                existAccount.setEmail(accountUpdateDetail.getEmail());
                existAccount.setCustomer(customerUpdateDetail);
                accountRepository.save(existAccount);

            }
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public Optional<Account> updateStaffAccount(Long id, AccountStaffDTO dto, MultipartFile imageFile) throws IOException {
        // 1. Find the existing account by its ID
        Optional<Account> existingAccountOpt = accountRepository.findById(id);

        if (existingAccountOpt.isEmpty()) {
            return Optional.empty(); // Return empty if account not found
        }

        Account accountToUpdate = existingAccountOpt.get();
        Staff staffToUpdate = accountToUpdate.getStaff();

        // Ensure the staff entity exists
        if (staffToUpdate == null) {
            throw new IllegalStateException("Account with ID " + id + " does not have a linked staff profile.");
        }

        // 2. Update the Account and Staff entities from the DTO
        accountToUpdate.setEmail(dto.getEmail());
        // Note: Password updates should typically be handled in a separate, dedicated method for security.
        // We are omitting password changes here.

        staffToUpdate.setFullName(dto.getFullName());
        staffToUpdate.setPhoneNumber(dto.getPhoneNumber());
        staffToUpdate.setEmployeeId(dto.getEmployeeId());
        staffToUpdate.setDepartment(dto.getDepartment());

        // 3. If a new image is provided, upload it to Cloudinary, overwriting the old one
        if (imageFile != null && !imageFile.isEmpty()) {
            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", staffToUpdate.getEmployeeId(), // Use existing employeeId to overwrite
                    "overwrite", true,
                    "resource_type", "image"
            );
            cloudinary.uploader().upload(imageFile.getBytes(), options);
        }

        // 4. Save the updated account. Cascade will handle the staff update.
        Account updatedAccount = accountRepository.save(accountToUpdate);
        return Optional.of(updatedAccount);
    }
    @Transactional
    public boolean deleteAccount(Account accountDetail) {
        if(accountRepository.existsById(accountDetail.getId())){
            accountRepository.delete(accountDetail);
            return true;
        }else{
            return false;
        }
    }

    public boolean validateNewAccount(String email){
        return accountRepository.existsByEmail(email);
    }


    public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: "));
        // This returns false if the email is unchanged OR if it's taken by another user.
        return !existingAccount.getEmail().equals(email) && accountRepository.existsByEmail(email);
    }

    /**
     * Checks if the provided email and password are valid.
     * Returns the Account object on success, or null on failure.
     */
    public Account checkLogin(String email, String password){
        // Find the account by email
        Account account = accountRepository.findByEmail(email).orElse(null);

        // If account exists and password matches, return the account
        if(account != null && passwordEncoder.matches(password, account.getPasswordHash())){
            return account;
        }
        // Otherwise, return null
        return null;
    }

    /**
     * Finds an account by its ID.
     * @param id The ID of the account.
     * @return The Account object or null if not found.
     */
    public Account findById(Long id) {
        return accountRepository.findById(id).orElse(null);
    }

    @Transactional // Use readOnly for performance
    public List<AccountDisplayDTO> getAllAccountsAsDTO() {
        return accountRepository.findAll()
                .stream()
                .map(AccountDisplayDTO::fromEntity) // Convert each Account to a DTO
                .toList();
    }

    public List<AccountStaffDTO> getAllStaff() {
        return accountRepository.findAll()
                .stream()
                .map(AccountStaffDTO::fromEntity)
                .filter(p -> p.getAccount() != null)
                .toList();
    }
}