import React from 'react';
import './App.css';
import { CiSearch } from "react-icons/ci";
import Login from './components/Login/Login'; // 🔹 Import component Login

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Tìm sản phẩm..." />
          <button>
            <CiSearch size={20} />
          </button>
        </div>
        <nav className="nav">
          <a href="#">Cửa hàng</a>
          <a href="#">Về chúng tôi</a>
          <a href="#">Liên hệ</a>
          <a href="#">Chính sách</a>
        </nav>
      </header>

      {/* Main Content - Trang Login */}
      <main className="main">
        <div className="breadcrumb">Trang chủ &gt; Đăng nhập tài khoản</div>
        <Login /> {/* 🔹 Dùng component Login ở đây */}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-columns">
          {/* Cột 1: Logo + Địa chỉ */}
          <div className="footer-column">
            <img src="/logo.png" alt="Logo" className="footer-logo" />
            <p>Công ty Dole Saigon</p>
            <p>Đường D1, Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM</p>
            <p>Email: contact@dolesaigon.vn</p>
            <p>Hotline: 0123 456 789</p>
          </div>

          {/* Cột 2: Chính sách */}
          <div className="footer-column">
            <h4>Chính sách</h4>
            <ul>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn */}
          <div className="footer-column">
            <h4>Hướng dẫn</h4>
            <ul>
              <li><a href="#">Hướng dẫn mua hàng</a></li>
              <li><a href="#">Hướng dẫn thanh toán</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ thanh toán */}
          <div className="footer-column">
            <h4>Hỗ trợ thanh toán</h4>
            <img src="/payment-methods.png" alt="Phương thức thanh toán" style={{ width: '100%' }} />
            {/* Bạn có thể dùng ảnh chứa các logo Visa, Momo, v.v. */}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          © 2025 Dole Saigon. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;
