import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';
import { useAuth } from '../../contexts/AuthContext'; // BƯỚC 1: Import useAuth

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // BƯỚC 2: Lấy hàm login từ AuthContext
  const { login } = useAuth();

  // BƯỚC 3: Cập nhật hàm handleSubmit để sử dụng context
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Gọi hàm login từ context
      const result = await login(email, password);

      if (result.success) {
        // --- CHANGE HERE ---
        // Nếu đăng nhập thành công, chuyển hướng về trang chủ
        // VÀ gửi kèm một state để hiển thị thông báo
        navigate('/', { state: { message: 'Đăng nhập thành công!', type: 'success' } });
      } else {
        // Nếu thất bại, hiển thị thông báo lỗi từ server
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      // Xử lý các lỗi kết nối mạng
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
      console.error("Lỗi khi đăng nhập:", err);
    }
  };

  // Giao diện component không thay đổi
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
            <button type="submit">Đăng nhập</button>
          </form>
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
          </p>
        </div>
      </div>
  );
};

export default Login;