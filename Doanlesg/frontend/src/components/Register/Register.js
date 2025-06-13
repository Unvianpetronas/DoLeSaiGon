import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css'; // Đảm bảo file CSS tồn tại

function Register() {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>ĐĂNG KÝ</h2>
        <form className="login-form">
          <input type="text" name="name" placeholder="Họ và tên" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="tel" name="phoneNumber" placeholder="Số điện thoại" required />
          <input type="password" name="password" placeholder="Mật khẩu" required />
          <button type="submit">Đăng ký</button>
        </form>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
