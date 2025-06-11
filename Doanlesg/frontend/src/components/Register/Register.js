import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css'; // Nếu bạn dùng chung CSS, hoặc tạo file riêng như Register.css

function Register() {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>ĐĂNG KÝ</h2>
        <form className="login-form">
          <input type="text" name="name" placeholder="Họ và tên" value="" required />
          <input type="email" name="email" placeholder="Email" value="" required />
          <input type="tel" name="phone" placeholder="Số điện thoại" value="" required />
          <input type="password" name="pasword" placeholder="Mật khẩu" value="" required />
          <button type="submit">Đăng ký</button>
        </form>
        <p> Đã có tài khoản? <a href="/login.js">Đăng ký tại đây</a></p>
      </div>
    </div>
  );
}

export default Register;
