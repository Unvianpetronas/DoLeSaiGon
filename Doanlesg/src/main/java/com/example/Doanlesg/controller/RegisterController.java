package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.RegisterRequest;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Customer;
import com.example.Doanlesg.services.AccountServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/register")
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


    @PostMapping("/createAccount")
    public String processRegistration(@ModelAttribute RegisterRequest registerRequest, RedirectAttributes redirectAttributes) {
        try {
            if (!accountServices.validateNewAccount(registerRequest.getEmail())) {
                redirectAttributes.addFlashAttribute("NOTIFICATION", "Đăng ký thất bại. Email này đã được sử dụng.");
                return "redirect:/error.html";
            }

            Account accountDetail = new Account();
            accountDetail.setEmail(registerRequest.getEmail());
            accountDetail.setPasswordHash(registerRequest.getPassword());

            Customer customerDetail = new Customer();
            customerDetail.setFullName(registerRequest.getFullName());
            customerDetail.setPhoneNumber(registerRequest.getPhoneNumber());

            Account createdAccount = accountServices.createCustomerAccount(accountDetail, customerDetail);

            if (createdAccount != null) {
                redirectAttributes.addFlashAttribute("NOTIFICATION", "Đăng ký thành công! Vui lòng đăng nhập.");
                return "redirect:/index.html";
            } else {
                throw new Exception("Không thể tạo tài khoản do lỗi không xác định.");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("NOTIFICATION", "Đã có lỗi xảy ra trong quá trình đăng ký.");
            return "redirect:/error.html";
        }
    }
}