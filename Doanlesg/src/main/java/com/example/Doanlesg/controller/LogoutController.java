package com.example.Doanlesg.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LogoutController {

    /**
     * Xử lý yêu cầu GET tới đường dẫn "/logout".
     * Phương thức này sẽ:
     * 1. Hủy phiên làm việc (session) phía server.
     * 2. Xóa cookie JSESSIONID (và các cookie khác nếu cần) phía trình duyệt.
     * 3. Chuyển hướng người dùng về trang đăng nhập.
     */
    @GetMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        // --- Hủy session phía server  ---
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Xóa cookie phía trình duyệt ---
        // Lấy tất cả cookie từ request
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                // Tìm cookie có tên JSESSIONID (hoặc tên cookie session của bạn)
                if (cookie.getName().equals("JSESSIONID")) {// Thiết lập thời gian sống của cookie = 0 để trình duyệt xóa nó
                    cookie.setMaxAge(0);

                    // Đặt path cho cookie. Rất quan trọng!
                    // Path phải khớp với path của cookie ban đầu.
                    // Sử dụng getContextPath() để đảm bảo nó hoạt động đúng ngay cả khi ứng dụng không được triển khai ở root context.
                    cookie.setPath(request.getContextPath().isEmpty() ? "/" : request.getContextPath());

                    // Thêm cookie đã được sửa đổi vào response để gửi về trình duyệt
                    response.addCookie(cookie);
                }

                //  Xóa các cookie khác mà bạn đã tạo
                // if (cookie.getName().equals("my_custom_cookie")) {
                //     cookie.setMaxAge(0);
                //     cookie.setPath(request.getContextPath().isEmpty() ? "/" : request.getContextPath());
                //     response.addCookie(cookie);
                // }
            }
        }

        // --- Chuyển hướng người dùng ---
        return "redirect:/login";
    }
}