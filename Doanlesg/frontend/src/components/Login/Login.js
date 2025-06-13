import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>ĐĂNG NHẬP</h2>
        <form className="login-form">
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Mật khẩu" required />
          <button type="submit">Đăng nhập</button>
        </form>
        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
