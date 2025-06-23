import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.name);
        setError('');
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Create a plain JavaScript object with the user's data
    const loginData = {
      username: username,
      password: password,
    };

    try {
      // 2. Perform the login POST request
      const response = await fetch('http://localhost:8080/api/ver0.0.1/login', {
        method: 'POST',
        // 3. Set the correct header for JSON
        headers: {
          'Content-Type': 'application/json',
        },
        // 4. Convert the JavaScript object to a JSON string
        body: JSON.stringify(loginData),
      });

      // 5. Check the response and then verify auth status
      if (response.ok) {
        console.log('Login request successful');
        await checkAuthStatus();
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    }
  };

  if (user) {
    return <div>Welcome, {user}!</div>;
  }

  return (
      <div className="login-wrapper">
        <div className="login-container">
          <h2>ĐĂNG NHẬP</h2>
          {error && <p className="error-message">{error}</p>}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* IMPORTANT: Added value and onChange to connect inputs to state */}
            <input
                type="email"
                name="username"
                placeholder="Email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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