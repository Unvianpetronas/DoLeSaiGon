import React, { useState, useEffect, useRef } from 'react';
import './DeliveryManagement.css';
import { FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Helper function to check for multiple roles
const hasRole = (user, ...roles) => {
  if (!user || !user.roles) return false;
  return roles.some(role => {
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return user.roles === role;
  });
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
  const [selectedStaffNames, setSelectedStaffNames] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || !hasRole(user, 'ROLE_ADMIN', 'ROLE_STAFF')) {
      addNotification('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersRes, staffRes] = await Promise.all([
          fetch('http://localhost:8080/api/ver0.0.1/staff/orders', { credentials: 'include' }),
          fetch('http://localhost:8080/api/ver0.0.1/staff/accounts', { credentials: 'include' })
        ]);

        if (!ordersRes.ok || !staffRes.ok) {
          throw new Error('Không thể tải dữ liệu điều phối.');
        }

        const allOrders = await ordersRes.json();
        const allAccounts = await staffRes.json();

        // ✅ FIX: Filter for orders that need delivery assignment
        const shippingOrders = allOrders
            .filter(o => o.orderStatus === 'Shipping' || o.orderStatus === 'Pending') // Or whatever statuses you want to manage
            .map(o => ({...o, assignedStaffId: o.assignedStaffId || null})); // Assume backend provides assignedStaffId
        setDeliveries(shippingOrders);

        // ✅ FIX: Filter for accounts that are staff or admins
        const staffAndAdmins = allAccounts.filter(acc => hasRole(acc, 'ROLE_STAFF'));
        setAllStaff(staffAndAdmins);

        // ✅ FIX: Initially, select all staff for the filter using the flat structure
        setSelectedStaffNames(staffAndAdmins.map(s => s.fullName));

      } catch (err) {
        setError(err.message);
        addNotification(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthLoading, navigate, addNotification]);

  // ✅ FIX: Updated filtering logic
  const filteredDeliveries = deliveries.filter(d => {
    const assignedStaffMember = allStaff.find(s => s.id === d.assignedStaffId);
    const staffName = assignedStaffMember?.fullName;

    const matchesStaff = selectedStaffNames.length === 0 || (staffName && selectedStaffNames.includes(staffName));
    const matchesKeyword = d.receiverFullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        d.orderCode.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesStaff && matchesKeyword;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStaffSelectChange = (orderId, newStaffId) => {
    // Update the state locally to make the UI responsive
    setDeliveries(prevDeliveries =>
        prevDeliveries.map(d =>
            d.id === orderId ? { ...d, assignedStaffId: newStaffId ? parseInt(newStaffId, 10) : null } : d
        )
    );
    // TODO: Call the backend API to save this change
    addNotification('Cần kết nối API để lưu thay đổi nhân viên.', 'info');
    // Example: fetch(`/api/orders/${orderId}/assign?staffId=${newStaffId}`, { method: 'PUT' });
  };

  const handleDelete = (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) return;
    setDeliveries(prev => prev.filter(d => d.id !== orderId));
    // TODO: Call backend to delete
    addNotification('Cần kết nối API để xóa vĩnh viễn.', 'info');
  }

  const handleStaffFilterChange = (staffName) => {
    setSelectedStaffNames(prev =>
        prev.includes(staffName) ? prev.filter(s => s !== staffName) : [...prev, staffName]
    );
  };
  const handleSelectAll = () => setSelectedStaffNames(allStaff.map(s => s.fullName));
  const handleClearAll = () => setSelectedStaffNames([]);


  if (isAuthLoading || loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="delivery-management-error">Lỗi: {error}</div>;

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
                {/* ✅ FIX: Use flat staffAccount object */}
                {allStaff.map((staffAccount) => (
                    <label key={staffAccount.id} className="filter-option-item">
                      <input
                          type="checkbox"
                          className="filter-checkbox"
                          checked={selectedStaffNames.includes(staffAccount.fullName)}
                          onChange={() => handleStaffFilterChange(staffAccount.fullName)}
                      />
                      <span className="filter-label">{staffAccount.fullName}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>
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
              <th>Nhân viên Giao Hàng</th>
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
                    {/* ✅ FIX: Use assignedStaffId for value and flat staffAccount for options */}
                    <select
                        value={d.assignedStaffId || ''}
                        onChange={(e) => handleStaffSelectChange(d.id, e.target.value)}
                        className="staff-dropdown"
                    >
                      <option value="">-- Chọn NV --</option>
                      {allStaff.map((staffAccount) => (
                          <option key={staffAccount.id} value={staffAccount.id}>
                            {staffAccount.fullName}
                          </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <FaTrashAlt className="icon delete" title="Xóa" onClick={() => handleDelete(d.id)} />
                  </td>
                </tr>
            ))}
            {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
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