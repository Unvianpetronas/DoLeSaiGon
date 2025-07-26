import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomersManagement.css';
import { CiSearch } from 'react-icons/ci';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Helmet } from 'react-helmet-async';

// Helper function to safely check for a user's role
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

const CustomersManagement = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotification();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');

  // Effect to handle authorization and data fetching
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || !hasRole(user, 'ROLE_ADMIN')) {
      addNotification('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/ver0.0.1/staff/accounts', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Không thể tải danh sách khách hàng.');
        }
        const data = await response.json();
        // ✅ FIX: Filter by role instead of checking for a nested object.
        const customerAccounts = data.filter(acc => hasRole(acc, 'ROLE_CUSTOMER'));
        setCustomers(customerAccounts);
      } catch (err) {
        setError(err.message);
        addNotification(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user, isAuthLoading, navigate, addNotification]);

  // This filter correctly works with the flat JSON structure.
  const filteredCustomers = customers.filter((c) =>
      c?.phoneNumber?.includes(searchPhone)
  );

  const handleExportCSV = () => {
    const headers = ['Mã KH', 'Họ và tên', 'Số điện thoại', 'Email'];
    const rows = filteredCustomers.map(c => [
      `KH${c.id}`,
      c.fullName,
      c.phoneNumber,
      c.email,
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell || ''}"`).join(','))
        .join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_sach_khach_hang.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isAuthLoading || loading) {
    return <div>Đang tải dữ liệu khách hàng...</div>;
  }

  if (error) {
    return <div className="customers-management-error">Lỗi: {error}</div>
  }

  return (
      <div className="customers-management">
        <Helmet>
          <title>Danh Sách Khách Hàng</title>
        </Helmet>
        <h2>Danh Sách Khách Hàng</h2>
        <div className="admin-controls">
          <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>
          <div className="search-bar">
            <input
                type="text"
                placeholder="Lọc theo số điện thoại..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
            />
            <button><CiSearch size={20} /></button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="customer-table">
            <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
            </tr>
            </thead>
            <tbody>
            {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{`KH${c.id}`}</td>
                  {/* ✅ FIX: Access properties directly from 'c' */}
                  <td>{c.fullName}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.email}</td>
                </tr>
            ))}
            {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    Không tìm thấy khách hàng.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default CustomersManagement;