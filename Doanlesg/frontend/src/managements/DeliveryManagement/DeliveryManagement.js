import React, { useState, useEffect, useRef } from 'react';
import './DeliveryManagement.css';
import { FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Helper function to safely check for a user's role
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

const DeliveryManagement = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotification();

  const [deliveries, setDeliveries] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // Effect for authorization and data fetching
  useEffect(() => {
    if (isAuthLoading) return;

    // Only Admins can access this page
    if (!user || !hasRole(user, 'ROLE_ADMIN')) {
      addNotification('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both orders and staff members at the same time
        const [ordersRes, staffRes] = await Promise.all([
          fetch('http://localhost:8080/api/ver0.0.1/staff/orders', { credentials: 'include' }),
          fetch('http://localhost:8080/api/ver0.0.1/staff/accounts', { credentials: 'include' })
        ]);

        if (!ordersRes.ok || !staffRes.ok) {
          throw new Error('Không thể tải dữ liệu điều phối.');
        }

        const allOrders = await ordersRes.json();
        const allAccounts = await staffRes.json();

        // Filter for orders that are currently shipping
        const shippingOrders = allOrders.filter(o => o.orderStatus === 'Shipping');
        setDeliveries(shippingOrders);

        // Filter for accounts that are staff members
        const staffAccounts = allAccounts.filter(acc => acc.staff !== null);
        setAllStaff(staffAccounts);

        // Initially, select all staff for the filter
        setSelectedStaff(staffAccounts.map(s => s.staff.fullName));

      } catch (err) {
        setError(err.message);
        addNotification(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData().then();
  }, [user, isAuthLoading, navigate, addNotification]);

  // Derived state for filtering deliveries based on search and selected staff
  const filteredDeliveries = deliveries.filter(d =>
      (selectedStaff.length === 0 || selectedStaff.includes(d.assignedStaff?.fullName)) && // Assuming order has assignedStaff
      (d.receiverFullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          d.orderCode.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  // Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- API-driven Actions ---

  const handleConfirmToggle = async (orderId, currentStatus) => {
    // TODO: Implement backend logic to confirm delivery
    // This would likely change the order status from 'Shipping' to 'Complete'
    console.log(`Toggling confirmation for order ID: ${orderId}`);
    addNotification('Chức năng này cần được kết nối với API backend.', 'error');
    // Example API call:
    // await fetch(`/api/ver0.0.1/staff/orders/${orderId}/confirm`, { method: 'PUT', credentials: 'include' });
  };

  const handleStaffSelectChange = async (orderId, newStaffId) => {
    // TODO: Implement backend logic to assign a staff member to an order
    console.log(`Assigning staff ID: ${newStaffId} to order ID: ${orderId}`);
    addNotification('Chức năng này cần được kết nối với API backend.', 'error');
    // Example API call:
    // await fetch(`/api/ver0.0.1/staff/orders/${orderId}/assign?staffId=${newStaffId}`, { method: 'PUT', credentials: 'include' });
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn giao hàng này không?")) return;
    // TODO: Implement backend logic to delete an order
    console.log(`Deleting order ID: ${orderId}`);
    addNotification('Chức năng này cần được kết nối với API backend.', 'error');
    // Example API call:
    // await fetch(`/api/ver0.0.1/staff/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
  };


  // --- UI Handlers ---
  const handleExportCSV = () => { /* ... your existing CSV logic ... */ };
  const handleStaffChange = (staffName) => {
    setSelectedStaff(prev =>
        prev.includes(staffName) ? prev.filter(s => s !== staffName) : [...prev, staffName]
    );
  };
  const handleSelectAll = () => setSelectedStaff(allStaff.map(s => s.staff.fullName));
  const handleClearAll = () => setSelectedStaff([]);


  if (isAuthLoading || loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="delivery-management-error">Lỗi: {error}</div>;
  }

  return (
      <div className="delivery-management">
        <h2>Danh Sách Đơn Giao Hàng</h2>
        <div className="admin-controls">
          <div className="filter-container" ref={filterRef}>
            <button className="btn pink" onClick={() => setShowFilter(prev => !prev)}>Lọc theo nhân viên</button>
            <div className={`filter-popup ${showFilter ? 'show' : ''}`}>
              <div className="filter-commands">
                <span className="link" onClick={handleSelectAll}>Chọn tất cả</span>
                <span className="link" onClick={handleClearAll}>Bỏ chọn</span>
              </div>
              <div className="filter-options">
                {allStaff.map((staffAccount) => (
                    <label key={staffAccount.id} className="filter-option-item">
                      <input
                          type="checkbox"
                          className="filter-checkbox"
                          checked={selectedStaff.includes(staffAccount.staff.fullName)}
                          onChange={() => handleStaffChange(staffAccount.staff.fullName)}
                      />
                      <span className="filter-label">{staffAccount.staff.fullName}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>
          <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>
          <div className="search-bar">
            <input
                type="text"
                placeholder="Tìm mã đơn hoặc tên KH..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button><CiSearch size={20} /></button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="admin-product-table">
            <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Tên KH</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Nhân viên</th>
              <th>Confirm</th>
              <th>Tính năng</th>
            </tr>
            </thead>
            <tbody>
            {filteredDeliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.orderCode}</td>
                  <td>{d.receiverFullName}</td>
                  <td>{d.receiverPhoneNumber}</td>
                  <td>{d.fullShippingAddress}</td>
                  <td>
                    <select
                        value={d.assignedStaff?.id || ''} // Assuming order has assignedStaff.id
                        onChange={(e) => handleStaffSelectChange(d.id, e.target.value)}
                        className="staff-dropdown"
                    >
                      <option value="">-- Chọn NV --</option>
                      {allStaff.map((staffAccount) => (
                          <option key={staffAccount.id} value={staffAccount.id}>
                            {staffAccount.staff.fullName}
                          </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                        type="checkbox"
                        checked={d.deliveryConfirmed || false} // Assuming a field like this
                        onChange={() => handleConfirmToggle(d.id, d.deliveryConfirmed)}
                    />
                  </td>
                  <td>
                    <FaTrashAlt className="icon delete" title="Xóa" onClick={() => handleDelete(d.id)} />
                  </td>
                </tr>
            ))}
            {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default DeliveryManagement;
