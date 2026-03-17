import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

// Helper function to safely check for a user's role
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const isUserAdmin = hasRole(user, 'ROLE_ADMIN');
  const isUserStaff = hasRole(user, 'ROLE_STAFF');
  const isAuthorized = isUserAdmin || isUserStaff;

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      navigate('/login');
    }
  }, [isLoading, isAuthorized, navigate]);

  if (isLoading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo-container">
            <img src="/images/logo.png" alt="Logo" className="admin-logo-image" />
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
              </ul>
            </div>

            {isUserAdmin && (
                <div className="menu-section">
                  <div className="side-menu-title">ADMIN</div>
                  <ul>
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
            )}
          </div>
          <div className="back-home-link">
            <Link to="/" className="btn-back-home">Trang chủ</Link>
          </div>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
  );
}