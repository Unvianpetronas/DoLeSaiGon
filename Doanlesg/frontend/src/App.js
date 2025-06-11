import React from 'react';
import './App.css';
import { CiSearch } from "react-icons/ci";
import Login from './components/Login/Login';
import Cart from "./components/Cart/Cart";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { FaRegHeart, FaUser, FaShoppingCart, FaClipboardList, FaMapMarkerAlt } from "react-icons/fa";

function App() {
  return (
  <div>

    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="top-header">
          <div className="logo">
            <img src="/logo.png" alt="Logo" />
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Tìm sản phẩm..." />
            <button>
              <CiSearch size={20} />
            </button>
          </div>

          <div className="icon-group">
            <div className="icon-item">
              <FaMapMarkerAlt />
              <div className="icon-text">Cửa hàng</div>
            </div>
            <div className="icon-item">
              <FaRegHeart />
              <div className="icon-text">Yêu thích</div>
            </div>
            <div className="icon-item">
              <FaUser />
              <div className="icon-text">Tài khoản</div>
            </div>
            <div className="icon-item">
              <FaShoppingCart />
              <div className="icon-text">Giỏ hàng</div>
            </div>
            <div className="icon-item">
              <FaClipboardList />
              <div className="icon-text">Đơn hàng</div>
            </div>
          </div>
        </div>

        <nav className="bottom-menu">
                 <a href="#" className="menu-item category-menu">
                   <span className="menu-icon">
                     {/* SVG logo */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                       <rect x="3" y="3" width="7" height="7" rx="1" ry="1"/>
                       <rect x="14" y="3" width="7" height="7" rx="1" ry="1"/>
                       <rect x="3" y="14" width="7" height="7" rx="1" ry="1"/>
                       <rect x="14" y="14" width="7" height="7" rx="1" ry="1"/>
                     </svg>
                   </span>
                   <span className="menu-text">DANH MỤC SẢN PHẨM</span>
                   <span className="menu-arrow">▾</span>
                 </a>

                 <a href="#" className="menu-item">Trang chủ</a>
                 <a href="#" className="menu-item">Giới thiệu</a>
                 <a href="#" className="menu-item">Sản phẩm</a>
                 <a href="#" className="menu-item">Liên hệ</a>
                 <a href="#" className="menu-item">Chính sách</a>
               </nav>
      </header>

      {/* Main */}
      <main className="main">
        <div className="breadcrumb"><a href="/">Trang chủ</a> &gt; <span>Thanh toán</span></div>
        <Cart />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-columns">
          <div className="footer-column">
            <img src="/logo.png" alt="Logo Footer" />
            <p>Công ty Dole Saigon</p>
            <p>Đường D1, Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM</p>
            <p>Email: contact@dolesaigon.vn</p>
            <p>Hotline: 0123 456 789</p>
          </div>
          <div className="footer-column">
            <h4>Chính sách</h4>
            <ul>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Hướng dẫn</h4>
            <ul>
              <li><a href="#">Hướng dẫn mua hàng</a></li>
              <li><a href="#">Hướng dẫn thanh toán</a></li>
              <li><a href="#">Hướng dẫn đổi trả</a></li>
              <li><a href="#">Hướng dẫn bảo hành</a></li>
            </ul>
          </div>
           {/* Cột 4: Hỗ trợ thanh toán */}
                    <div className="footer-column">
                      <h4>Hỗ trợ thanh toán</h4>
                      <img src="/payment.png" alt="Phương thức thanh toán" style={{ width: '100%' }} />
                      {/* Bạn có thể dùng ảnh chứa các logo Visa, Momo, v.v. */}
                    </div>
        </div>
        <p>© 2025 Dole Saigon. All rights reserved.</p>
      </footer>
    </div>
    </div>
  );
}

export default App;
