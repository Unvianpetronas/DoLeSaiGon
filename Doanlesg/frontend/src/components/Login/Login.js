import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm state loading
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('User  authenticated:', data);
        navigate('/index.html');
      } else {
        console.log('User  not authenticated.');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Bắt đầu trạng thái loading
    try {
      const response = await fetch('http://localhost:8080/api/ver0.0.1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: email, password }), // Sửa 'email' thành 'username' để phù hợp với backend
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
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>ĐĂNG NHẬP</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
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
          <button type="submit" disabled={loading}> {/* Vô hiệu hóa nút khi đang tải */}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p>
          Chưa có tài khoản? <Link to="/register.html">Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;