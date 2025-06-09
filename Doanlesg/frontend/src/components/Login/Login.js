import React from 'react';

function Login() {
  return (
    <div className="login-container">
      <h2>ĐĂNG NHẬP</h2>
      <form className="login-form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Mật khẩu" required />
        <button type="submit">Đăng nhập</button>
      </form>
      <p>Chưa có tài khoản? <a href="/register">Đăng ký tại đây</a></p>
    </div>
  );
}

export default Login;
