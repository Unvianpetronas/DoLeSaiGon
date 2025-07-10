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

  // Effect to handle redirection for unauthorized users
  useEffect(() => {
    // Wait until the initial loading is complete
    if (!isLoading) {
      // If user is not an Admin or Staff, redirect them
      if (!isUserAdmin && !isUserStaff) {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate, isUserAdmin, isUserStaff]);


  // Show a loading screen while we check for authentication
  if (isLoading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  // If user is not authorized, render nothing while the redirect happens
  if (!isUserAdmin && !isUserStaff) {
    return null;
  }

  // If authorized, render the layout
  return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo-container">
            <img src="/images/logo.png" alt="Logo" className="admin-logo-image" />
          </div>
          <div className="admin-menu-wrapper">

            {/* Staff and Admin Menu Section */}
            {(isUserStaff || isUserAdmin) && (
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
            )}

            {/* Admin-Only Menu Section */}
            {isUserAdmin && (
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
            )}
          </div>
          <div className="back-home-link">
            <Link to="/" className="btn-back-home">Trang chủ</Link>
          </div>
        </aside>

        <main className="admin-content">
          <Outlet /> {/* Child routes like Dashboard, Products, etc., will render here */}
        </main>
      </div>
  );
}