import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="%PUBLIC_URL%/logo.png" alt="DoleSaigon Logo" />
          <h1>DoleSaigon</h1>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Tìm sản phẩm..." />
          <button>🔍</button>
        </div>
        <nav className="nav">
          <a href="#">Cửa hàng</a>
          <a href="#">Về chúng tôi</a>
          <a href="#">Liên hệ</a>
          <a href="#">Chính sách</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="breadcrumb">Trang chủ > Đăng nhập tài khoản</div>
        <div className="login-container">
          <h2>ĐĂNG NHẬP</h2>
          <form className="login-form">
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Mật khẩu" required />
            <button type="submit">Đăng nhập</button>
          </form>
          <div className="social-login">
            <button className="fb-btn">Facebook</button>
            <button className="gg-btn">Google</button>
          </div>
          <p>Quên mật khẩu? <a href="#">Đăng ký tại đây</a></p>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="%PUBLIC_URL%/logo.png" alt="DoleSaigon Logo" />
            <h2>DoleSaigon</h2>
          </div>
          <div className="footer-sections">
            <div className="footer-section">
              <h3>CHÍNH SÁCH</h3>
              <p>Chính sách mua hàng</p>
              <p>Chính sách thanh toán</p>
              <p>Chính sách vận chuyển</p>
              <p>Chính sách bảo mật</p>
              <p>Chính sách trả hàng</p>
            </div>
            <div className="footer-section">
              <h3>HƯỚNG DẪN</h3>
              <p>Hướng dẫn mua hàng</p>
              <p>Hướng dẫn đổi trả</p>
              <p>Hướng dẫn thanh toán</p>
              <p>Hướng dẫn bảo hành</p>
            </div>
            <div className="footer-section">
              <h3>HỖ TRỢ THANH TOÁN</h3>
              <div className="payment-methods">
                <img src="%PUBLIC_URL%/momo.png" alt="Momo" />
                <img src="%PUBLIC_URL%/zalo.png" alt="ZaloPay" />
                <img src="%PUBLIC_URL%/vnpay.png" alt="VNPAY" />
                <img src="%PUBLIC_URL%/visa.png" alt="Visa" />
                <img src="%PUBLIC_URL%/mastercard.png" alt="Mastercard" />
              </div>
            </div>
          </div>
          <div className="footer-contact">
            <p>Địa chỉ: 7D, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</p>
            <p>Điện thoại: 028 7300 5588</p>
            <p>Email: support@sapo.vn</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© Bản quyền thuộc về DOLESAIGON</p>
        </div>
      </footer>
    </div>
  );
}

export default App;