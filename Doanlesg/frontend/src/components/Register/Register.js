import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // Nếu bạn dùng chung CSS, hoặc tạo file riêng như Register.css

function Register() {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>ĐĂNG KÝ</h2>
        <form className="login-form">
          <input type="text" placeholder="Họ và tên" required />
          <input type="email" placeholder="Email" required />
          <input type="tel" placeholder="Số điện thoại" required />
          <input type="password" placeholder="Mật khẩu" required />
          <button type="submit">Đăng ký</button>
        </form>
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></p>
      </div>
    </div>
  );
}

export default Register;
