import React from 'react';
import './App.css';

import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { CiSearch } from "react-icons/ci";
import { FaRegHeart, FaUser, FaShoppingCart, FaClipboardList, FaMapMarkerAlt } from "react-icons/fa";

import Shop from './components/Shop/Shop';
import Like from './components/Like/Like';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import CategoryMenu from './components/CategoryMenu/CategoryMenu';
import Homepage from './components/Homepage/Homepage';
import Introduction from "./components/Introduction/Introduction";
import Products from './components/Products/Products';
import Contact from "./components/Contact/Contact";
import Policy from './components/Policy/Policy';
import Instructions from './components/Policy/Instructions';
import OrderPage from './components/OrderPage/OrderPage';
import Description from './components/Description/Description';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import Success from './components/Success/Success';
import Details from "./components/Details/Details";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<PageWrapper label="Đăng nhập"><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper label="Đăng ký"><Register /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper label="Giỏ hàng"><Cart /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper label="Liên hệ"><Contact /></PageWrapper>} />
            <Route path="/products" element={<PageWrapper label="Sản phẩm"><Products /></PageWrapper>} />
            <Route path="/introduction" element={<PageWrapper label="Giới thiệu"><Introduction /></PageWrapper>} />
            <Route path="/checkout" element={<PageWrapper label="Thanh toán ngay"><Checkout /></PageWrapper>} />
            <Route path="/success" element={<PageWrapper label="Đặt hàng thành công"><Success /></PageWrapper>} />
            <Route path="/details/:orderId" element={<PageWrapper label="Chi tiết đơn hàng"><Details /></PageWrapper>} />
            <Route path="/policy/:policyType" element={<PolicyWrapper />} />
            <Route path="/instructions/:instructionType" element={<Instructions />} />
            <Route path="/shop" element={<PageWrapper label="Hệ thống cửa hàng"><Shop /></PageWrapper>} />
            <Route path="/like" element={<PageWrapper label="Yêu thích"><Like /></PageWrapper>} />
            <Route path="/product/:productId" element={<Description />} />
            <Route path="/category/:categorySlug" element={<CategoryWrapper />} />
            <Route path="/orderpage" element={<PageWrapper label="Đơn hàng"><OrderPage /></PageWrapper>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="top-header">
        <div className="logo">
            <img src="/logo.png" alt="Logo" />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Tìm sản phẩm..." />
          <button><CiSearch size={20} /></button>
        </div>
        <div className="icon-group">
         <Link to="/shop" className="icon-item">
           <FaMapMarkerAlt />
           <div className="icon-text">Cửa hàng</div>
         </Link>
         <Link to="/like" className="icon-item">
           <FaRegHeart />
           <div className="icon-text">Yêu thích</div>
         </Link>
          <div className="icon-item account-dropdown">
            <FaUser />
            <div className="icon-text">Tài khoản ▾</div>
            <div className="dropdown-content">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </div>
          </div>
          <Link to="/cart" className="icon-item"><FaShoppingCart /><div className="icon-text">Giỏ hàng</div></Link>
          <Link to="/orderpage" className="icon-item"><FaClipboardList /><div className="icon-text">Đơn hàng</div></Link>
        </div>
      </div>
      <nav className="bottom-menu">
        <div className="menu-item category-menu">
                  <CategoryMenu />
                </div>
        <Link to="/" className="menu-item">Trang chủ</Link>
        <Link to="/introduction" className="menu-item">Giới thiệu</Link>
       <div className="menu-item dropdown">
                 <Link to="/products" className="dropdown-title">Sản phẩm ▾</Link>
                   <div className="dropdown-content">
                               <Link to="/category/mam-hoa-qua">Mâm hoa quả</Link>
                               <Link to="/category/mam-cung-le">Mâm cúng lễ</Link>
                               <Link to="/category/hop-qua-tang">Hộp quà tặng</Link>
                               <Link to="/category/mam-banh">Mâm bánh</Link>
                               <Link to="/category/mam-chay-man">Mâm chay, mặn</Link>
                             </div>
                 </div>
        <Link to="/contact" className="menu-item">Liên hệ</Link>
        <div className="menu-item dropdown">
          <span>Chính sách ▾</span>
          <div className="dropdown-content">
            <Link to="/policy/mua-hang">Chính sách mua hàng</Link>
            <Link to="/policy/thanh-toan">Chính sách thanh toán</Link>
            <Link to="/policy/van-chuyen">Chính sách vận chuyển</Link>
            <Link to="/policy/cam-ket">Cam kết của hàng</Link>
            <Link to="/policy/bao-mat">Chính sách bảo mật</Link>
            <Link to="/policy/thanh-vien">Chính sách thành viên</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
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
            <li><Link to="/policy/mua-hang">Chính sách mua hàng</Link></li>
            <li><Link to="/policy/thanh-toan">Chính sách thanh toán</Link></li>
            <li><Link to="/policy/van-chuyen">Chính sách vận chuyển</Link></li>
            <li><Link to="/policy/cam-ket">Cam kết của hàng</Link></li>
            <li> <Link to="/policy/bao-mat">Chính sách bảo mật</Link></li>
            <li><Link to="/policy/thanh-vien">Chính sách thành viên</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Hướng dẫn</h4>
          <ul>
           <li><Link to="/instructions/huong-dan-mua-hang">Hướng dẫn mua hàng</Link></li>
           <li><Link to="/instructions/huong-dan-doi-tra">Hướng dẫn đổi trả</Link></li>
           <li><Link to="/instructions/huong-dan-thanh-toan">Hướng dẫn thanh toán</Link></li>
           <li><Link to="/instructions/quy-dinh-bao-hanh">Quy định bảo hành</Link></li>
           <li><Link to="/instructions/huong-dan-chuyen-khoan">Hướng dẫn chuyển khoản</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Hỗ trợ thanh toán</h4>
          <img src="/images/payment.png" alt="Phương thức thanh toán" style={{ width: '50%' }} />
        </div>
      </div>
      <p>© 2025 Dole Saigon. All rights reserved.</p>
    </footer>
  );
}

function Breadcrumb({ segments }) {
  return (
    <div className="breadcrumb">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.link ? <Link to={segment.link}>{segment.label}</Link> : <span>{segment.label}</span>}
          {index < segments.length - 1 && <span> &gt; </span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PageWrapper({ label, children }) {
  return (
    <>
      <Breadcrumb segments={[{ label: 'Trang chủ', link: '/' }, { label }]} />
      {children}
    </>
  );
}

const categories = {
  'mam-hoa-qua': 'Mâm hoa quả',
  'mam-cung-le': 'Mâm cúng lễ',
  'hop-qua-tang': 'Hộp quà tặng',
  'mam-banh': 'Mâm bánh',
  'mam-chay-man': 'Mâm chay, mặn',
};

function CategoryWrapper() {
  const { categorySlug } = useParams();
  const label = categories[categorySlug] || 'Danh mục';
  return <PageWrapper label={label}><Products /></PageWrapper>;
}

const policyTitles = {
  'mua-hang': 'Chính sách mua hàng',
  'thanh-toan': 'Chính sách thanh toán',
  'van-chuyen': 'Chính sách vận chuyển',
  'cam-ket': 'Cam kết của hàng',
  'bao-mat': 'Chính sách bảo mật',
  'thanh-vien': 'Chính sách thành viên',
};

function PolicyWrapper() {
  const { policyType } = useParams();
  const label = policyTitles[policyType] || 'Chính sách';

  return (
    <PageWrapper label={label}>
      <Policy />
    </PageWrapper>
  );
}
export default App;
