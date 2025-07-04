import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom'; // THÊM Outlet
import logo from '../../assets/logo.png';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-container">
          <img src={logo} alt="Logo" className="admin-logo-image" />
        </div>
        <div className="admin-menu-wrapper">
          <div className="menu-section">
            <div className="side-menu-title">NHÂN VIÊN</div>
            <ul>
              <li className={location.pathname.includes('/admin/products') ? 'active' : ''}>
                <Link to="/admin/products">Quản lí sản phẩm</Link>
              </li>
              <li className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
                <Link to="/admin/orders">Quản lí đơn hàng</Link>
              </li>
              <li className={location.pathname.includes('/admin/warehouse') ? 'active' : ''}>
                <Link to="/admin/warehouse">Quản lí kho hàng</Link>
              </li>
            </ul>
          </div>
          <div className="menu-section">
            <div className="side-menu-title">ADMIN</div>
            <ul>
              <li className={location.pathname === '/admin/delivery' ? 'active' : ''}>
                <Link to="/admin/delivery">Điều phối giao hàng</Link>
              </li>
              <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                <Link to="/admin/dashboard">Báo cáo doanh thu</Link>
              </li>
              <li className={location.pathname.includes('/admin/staff') ? 'active' : ''}>
                <Link to="/admin/staff">Quản lí nhân viên</Link>
              </li>
              <li className={location.pathname.includes('/admin/customer') ? 'active' : ''}>
                <Link to="/admin/customer">Quản lí người dùng</Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet /> {/* Trang con sẽ hiển thị ở đây */}
      </main>
    </div>
  );
}
