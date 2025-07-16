package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ApiResponse;
import com.example.Doanlesg.dto.RegisterRequest;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Customer;
import com.example.Doanlesg.services.AccountServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@RestController
@RequestMapping("/api/ver0.0.1/register")
@CrossOrigin(origins = "http://localhost:3000")
public class RegisterController {

    private final AccountServices accountServices;

    @Autowired
    public RegisterController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }

    @GetMapping
    public String showRegisterPage() {
        return "register.html"; // Trả về file register.html
    }

    // Phương thức này xử lý POST /register để xử lý dữ liệu form
   /* @PostMapping("/createAccount")
    public String register(
            @RequestParam(value = "fullName", required = false) String fullname,
            @RequestParam(value = "email") String email,
            @RequestParam(value = "password") String pass,
            @RequestParam(value = "phoneNumber") String phone,
            RedirectAttributes redirectAttributes) {
        try {
            Account accountDetail = new Account();
            accountDetail.setEmail(email);
            accountDetail.setPasswordHash(pass);

            Customer customerDetail = new Customer();
            customerDetail.setFullName(fullname);
            customerDetail.setPhoneNumber(phone);

            Account createdAccount = accountServices.createCustomerAccount(accountDetail, customerDetail);

            if (createdAccount != null) {
                redirectAttributes.addFlashAttribute("NOTIFICATION", "Đăng ký thành công. Vui lòng đăng nhập.");
                return "redirect:/login.html";
            } else {
                redirectAttributes.addFlashAttribute("NOTIFICATION", "Đăng ký thất bại. Email có thể đã tồn tại.");
                return "redirect:/error.html";
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("NOTIFICATION", "Đã có lỗi xảy ra trong quá trình đăng ký.");
            return "redirect:/error.html";
        }
    } */


    @PostMapping
    public ResponseEntity<ApiResponse> processRegistration(@RequestBody RegisterRequest registerRequest) {
        try {
            // Kiểm tra email đã tồn tại chưa
            if (!accountServices.validateNewAccount(registerRequest.getEmail())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT) // 409 Conflict
                        .body(new ApiResponse(false, "Đăng ký thất bại. Email này đã được sử dụng."));
            }


            Account accountDetail = new Account();
            accountDetail.setEmail(registerRequest.getEmail());
            accountDetail.setPasswordHash(registerRequest.getPassword());

            Customer customerDetail = new Customer();
            customerDetail.setFullName(registerRequest.getFullName());
            customerDetail.setPhoneNumber(registerRequest.getPhoneNumber());


            Account createdAccount = accountServices.createCustomerAccount(accountDetail, customerDetail);

            if (createdAccount != null) {
                return ResponseEntity
                        .status(HttpStatus.CREATED) // 201 Created
                        .body(new ApiResponse(true, "Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập."));
            } else {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
                        .body(new ApiResponse(false, "Không thể tạo tài khoản do lỗi không xác định."));
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
                    .body(new ApiResponse(false, "Đã có lỗi xảy ra trong quá trình đăng ký: " + e.getMessage()));
        }
    }
}