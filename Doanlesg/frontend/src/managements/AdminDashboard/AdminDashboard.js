import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import './AdminDashboard.css';

// Re-using the same helper function
const hasRole = (user, role) => {
    if (!user.roles || !user) return false;
    if (Array.isArray(user.roles)) {
        return user.roles.includes(role);
    }
    return user.roles === role;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const { addNotification } = useNotification();

    useEffect(() => {
        if (!isLoading) {
            if (!user || (!hasRole(user, 'ROLE_ADMIN') && !hasRole(user, 'ROLE_STAFF')) ) {
                addNotification('Bạn không có quyền truy cập trang này.', 'error');
                navigate('/login');
            }
        }
    }, [user, isLoading, navigate, addNotification]);

    if (isLoading) {
        return <div>Đang tải trang...</div>;
    }

    if (!user || !hasRole(user, 'ROLE_ADMIN')) {
        return null; // Render nothing while the redirect happens
    }

    return (
        <>
            <h2>Dashboard Quản Trị</h2>
            <div className="dashboard-cards">
                <div className="dashboard-card blue"><h3>Sản phẩm</h3><p>125</p></div>
                <div className="dashboard-card green"><h3>Đơn hàng</h3><p>320</p></div>
                <div className="dashboard-card yellow"><h3>Khách hàng</h3><p>87</p></div>
                <div className="dashboard-card red"><h3>Doanh thu</h3><p>124.000.000₫</p></div>
            </div>
        </>
    );
}