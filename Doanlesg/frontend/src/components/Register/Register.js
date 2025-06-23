import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css'; // Make sure this CSS file exists

function Register() {
  // --- 1. State Management ---
  // State for each input field
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // State for handling server responses
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- 2. Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setError('');
    setSuccessMessage('');

    const userData = {
      fullName: name, // Use fullName to match previous examples
      email,
      phoneNumber,
      password,
    };

    try {
      const response = await fetch('http://localhost:8080/api/ver0.0.1/register', { // Your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập.');
        // Clear the form on success
        setName('');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
      <div className="login-wrapper">
        <div className="login-container">
          <h2>ĐĂNG KÝ</h2>

          {/* Display feedback messages */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

          {/* --- 3. Connect Form to State and Handler --- */}
          <form className="login-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="tel"
                name="phoneNumber"
                placeholder="Số điện thoại"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
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