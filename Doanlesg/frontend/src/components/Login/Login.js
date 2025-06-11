import React from 'react';
import './Login.css';

function Login() {
  return (
  <div className="login-wrapper">
    <div className="login-container">
      <h2>ĐĂNG NHẬP</h2>
      <form className="login-form">
        <input type="email" name="email" value="" placeholder="Email" required />
        <input type="password" name="password" value="" placeholder="Mật khẩu" required />
        <button type="submit">Đăng nhập</button>
      </form>
      <p>Chưa có tài khoản? <a href="/register.js">Đăng ký tại đây</a></p>
    </div>
    </div>
  );
}

export default Login;
