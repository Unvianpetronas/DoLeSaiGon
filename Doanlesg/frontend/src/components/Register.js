// Login.js
import React, { useState } from "react";
import "./index.css";

export default function Login() {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", formData);
    // TODO: gửi formData đến server
  };

  return (
    <div className="register-container">
      <h2>ĐĂNG KÝ</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input name="lastName" placeholder="Họ" onChange={handleChange} required />
        <input name="firstName" placeholder="Tên" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="phone" placeholder="Số điện thoại" onChange={handleChange} required />
        <input name="password" placeholder="Mật khẩu" type="password" onChange={handleChange} required />
        <button type="submit">Đăng ký</button>
      </form>
      <p className="or-login">Hoặc đăng nhập bằng</p>
      <div className="social-login">
        <button className="facebook-btn">Facebook</button>
        <button className="google-btn">Google</button>
      </div>
    </div>
  );
}
