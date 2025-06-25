import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Có thể giữ hàm này nếu bạn muốn kiểm tra trạng thái đăng nhập sau khi trang được tải hoặc sau khi login thành công
  // Tuy nhiên, với defaultSuccessUrl của Spring Security, trình duyệt sẽ tự động chuyển hướng.
  const checkAuthStatus = async () => {
    try {
      const response =  fetch('http://localhost:8080/api/user', {
        credentials: 'include', // Quan trọng để gửi cookie phiên
      });
      if (response.ok) {
        const data = await response.json();
        console.log('User authenticated:', data);
        navigate('/index.html'); // Chuyển hướng sau khi xác thực thành công
      } else {
        console.log('User not authenticated.');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/ver0.0.1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
    }
  };


  // Nếu user đã đăng nhập (ví dụ: sau khi refresh trang và session vẫn còn),
  // bạn có thể muốn tự động chuyển hướng hoặc hiển thị thông tin user.
  // Tuy nhiên, với formLogin của Spring Security, việc này thường được xử lý bằng redirect backend.
  // if (user) {
  //   return <div>Welcome, {user}!</div>;
  // }

  return (
      <div className="login-wrapper">
        <div className="login-container">
          <h2>ĐĂNG NHẬP</h2>
          {error && <p className="error-message">{error}</p>}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Đảm bảo type là email và tên là email */}
            <input
                type="email"
                name="email" // Tên thuộc tính này không thực sự quan trọng khi bạn gửi bằng fetch với URLSearchParams, nhưng giữ nó rõ ràng vẫn tốt
                placeholder="Email"
                required
                value={email} // Gắn với state 'email'
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Đăng nhập</button>
          </form>
          <p>
            Chưa có tài khoản? <Link to="/register.html">Đăng ký tại đây</Link>
          </p>
        </div>
      </div>
  );
};

export default Login;