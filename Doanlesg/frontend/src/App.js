    import React from 'react';
    import './App.css';

    import { useParams } from 'react-router-dom';
    import { BrowserRouter as Router, Route, Routes, Link, Outlet} from 'react-router-dom';
    import { CiSearch } from 'react-icons/ci';
    import { FaRegHeart, FaUser, FaShoppingCart, FaClipboardList, FaMapMarkerAlt
    } from 'react-icons/fa';

    import { AuthProvider, useAuth } from './contexts/AuthContext';
    import { NotificationProvider } from './contexts/NotificationContext';
    import './components/common/Notification.css';

    import Shop from './components/Shop/Shop';
    import Like from './components/Like/Like';
    import Login from './components/Login/Login';
    import Register from './components/Register/Register';
    import CategoryMenu from './components/CategoryMenu/CategoryMenu';
    import Homepage from './components/Homepage/Homepage';
    import Introduction from './components/Introduction/Introduction';
    import Products from './components/Products/Products';
    import Contact from './components/Contact/Contact';
    import Policy from './components/Policy/Policy';
    import Instructions from './components/Policy/Instructions';
    import OrderPage from './components/OrderPage/OrderPage';
    import Description from './components/Description/Description';
    import Cart from './components/Cart/Cart';
    import Checkout from './components/Checkout/Checkout';
    import Success from './components/Success/Success';
    import Details from './components/Details/Details';
    import Payment from './components/Payment/Payment';

    import AdminDashboard from './managements/AdminDashboard/AdminDashboard';
    import AdminLayoutComponent from './managements/AdminLayout/AdminLayout';
    import ProductsManagement from './managements/ProductsManagement/ProductsManagement';
    import CreateProducts from './managements/CreateProducts/CreateProducts';
    import OrdersManagement from './managements/OrdersManagement/OrdersManagement';
    import EditProducts from './managements/EditProducts/EditProducts';
    import WarehouseManagement from './managements/WarehouseManagement/WarehouseManagement';
    import DeliveryManagement from './managements/DeliveryManagement/DeliveryManagement';
    import StaffsManagement from './managements/StaffsManagement/StaffsManagement';
    import CustomersManagement from './managements/CustomersManagement/CustomersManagement';

    function MainLayout({ label, children }) {
      return (
        <>
          <Header />
          <main className="main">
            <Breadcrumb segments={[{ label: 'Trang chủ', link: '/' }, { label }]} />
            {children}
          </main>
          <Footer />
        </>
      );
    }

    function NoBreadcrumbLayout({ children }) {
      return (
        <>
          <Header />
          <main className="main no-breadcrumb">{children}</main>
          <Footer />
        </>
      );
    }

    function AdminLayout() {
      return <AdminLayoutComponent><Outlet /></AdminLayoutComponent>;
    }

    function App() {
        return (
            <Router>
                <Routes>
                    {/* --- Customer Routes with Breadcrumb --- */}
                    <Route path="/cart" element={<MainLayout label="Giỏ hàng"><Cart /></MainLayout>} />
                    <Route path="/contact" element={<MainLayout label="Liên hệ"><Contact /></MainLayout>} />
                    <Route path="/products" element={<MainLayout label="Sản phẩm"><Products /></MainLayout>} />
                    <Route path="/introduction" element={<MainLayout label="Giới thiệu"><Introduction /></MainLayout>} />
                    <Route path="/checkout" element={<MainLayout label="Thanh toán"><Checkout /></MainLayout>} />
                    <Route path="/payment" element={<MainLayout label="Thanh toán đơn hàng"><Payment /></MainLayout>} />
                    <Route path="/success" element={<MainLayout label="Đặt hàng thành công"><Success /></MainLayout>} />
                    <Route path="/details/:orderId" element={<MainLayout label="Chi tiết đơn hàng"><Details /></MainLayout>} />
                    <Route path="/shop" element={<MainLayout label="Hệ thống cửa hàng"><Shop /></MainLayout>} />
                    <Route path="/like" element={<MainLayout label="Yêu thích"><Like /></MainLayout>} />
                    <Route path="/orderpage" element={<MainLayout label="Đơn hàng"><OrderPage /></MainLayout>} />
                    <Route path="/category/:categorySlug" element={<CategoryWrapper />} />
                    <Route path="/policy/:policyType" element={<PolicyWrapper />} />

                    {/* --- Customer Routes without Breadcrumb --- */}
                    <Route path="/" element={<NoBreadcrumbLayout><Homepage /></NoBreadcrumbLayout>} />
                    <Route path="/login" element={<NoBreadcrumbLayout><Login /></NoBreadcrumbLayout>} />
                    <Route path="/register" element={<NoBreadcrumbLayout><Register /></NoBreadcrumbLayout>} />
                    <Route path="/instructions/:instructionType" element={<NoBreadcrumbLayout><Instructions /></NoBreadcrumbLayout>} />
                    <Route path="/product/:productId" element={<NoBreadcrumbLayout><Description /></NoBreadcrumbLayout>} />

                    {/* --- Admin Routes with Admin Layout --- */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<ProductsManagement />} />
                        <Route path="create" element={<CreateProducts />} />
                        <Route path="orders" element={<OrdersManagement />} />
                        <Route path="edit/:id" element={<EditProducts />} />
                        <Route path="warehouse" element={<WarehouseManagement />} />
                        <Route path="delivery" element={<DeliveryManagement />} />
                        <Route path="staff" element={<StaffsManagement />} />
                        <Route path="customer" element={<CustomersManagement />} />
                    </Route>
                </Routes>
            </Router>
        );
    }

    function Header() {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = () => {
        logout();
    };

      return (
        <header className="header">
              <div className="top-header">
                  <div className="logo">
                      <Link to="/"><img src="/images/logo.png" alt="Logo" /></Link>
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

                      {/* --- THIS IS THE FIX --- */}
                      <div className="icon-item account-dropdown">
                          <FaUser />
                          {/* 1. While loading, show a generic state */}
                          {isLoading ? (
                              <div className="icon-text">Tài khoản ▾</div>

                              /* 2. When loading is false AND user exists, show user info */
                          ) : user ? (
                              <>
                                  <div className="icon-text">{user.email} ▾</div>
                                  <div className="dropdown-content">
                                      <Link to="/profile">Thông tin tài khoản</Link>
                                      {user.roles?.includes("ROLE_ADMIN") && (
                                          <Link to="/admin/dashboard">Admin</Link>
                                      )}
                                      <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
                                  </div>
                              </>

                              /* 3. When loading is false AND user is null, show login links */
                          ) : (
                              <>
                                  <div className="icon-text">Tài khoản ▾</div>
                                  <div className="dropdown-content">
                                      <Link to="/login">Đăng nhập</Link>
                                      <Link to="/register">Đăng ký</Link>
                                  </div>
                              </>
                          )}
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
              <img src="/images/logo.png" alt="Logo Footer" />
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
                <li><Link to="/policy/bao-mat">Chính sách bảo mật</Link></li>
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

    const categories = {
      'mam-hoa-qua': 'Mâm hoa quả',
      'mam-cung-le': 'Mâm cúng lễ',
      'hop-qua-tang': 'Hộp quà tặng',
      'mam-banh': 'Mâm bánh',
      'mam-chay-man': 'Mâm chay, mặn'
    };

  function CategoryWrapper() {
    const { categorySlug } = useParams();
    const label = categories[categorySlug] || 'Danh mục';
    return (
      <MainLayout label={label}>
      <Products />
      </MainLayout>
    );
  }

    const policyTitles = {
      'mua-hang': 'Chính sách mua hàng',
      'thanh-toan': 'Chính sách thanh toán',
      'van-chuyen': 'Chính sách vận chuyển',
      'cam-ket': 'Cam kết của hàng',
      'bao-mat': 'Chính sách bảo mật',
      'thanh-vien': 'Chính sách thành viên'
    };

    function PolicyWrapper() {
      const { policyType } = useParams();
      const label = policyTitles[policyType] || 'Chính sách';
      return (
        <MainLayout label={label}>
          <Policy />
        </MainLayout>
      );
    }

    export default App;