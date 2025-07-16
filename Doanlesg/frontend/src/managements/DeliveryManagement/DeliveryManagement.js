import React, { useState, useEffect, useRef } from 'react';
import './DeliveryManagement.css';
import { FaShippingFast, FaCheckCircle } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Helper function to check for multiple roles
const hasRole = (user, ...roles) => {
  if (!user || !user.roles) return false;
  return roles.some(role => Array.isArray(user.roles) ? user.roles.includes(role) : user.roles === role);
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
    if (!user || !hasRole(user, 'ROLE_ADMIN')) {
      addNotification('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Lưu ý: Các cuộc gọi API này vẫn cần backend cấu hình CORS để hoạt động
        const [ordersRes, staffRes] = await Promise.all([
          fetch('http://localhost:8080/api/ver0.0.1/staff/orders', { credentials: 'include' }),
          fetch('http://localhost:8080/api/ver0.0.1/staff/accounts', { credentials: 'include' })
        ]);
        if (!ordersRes.ok || !staffRes.ok) throw new Error('Không thể tải dữ liệu điều phối.');

        let allOrders = await ordersRes.json();
        const allAccounts = await staffRes.json();

        let shippingOrders = allOrders
            .filter(o => ['Pending', 'Shipping'].includes(o.orderStatus))
            .map(o => ({ ...o, assignedStaffId: o.assignedStaffId || null }));

        // SỬA: Đọc dữ liệu từ Local Storage
        shippingOrders = shippingOrders.map(order => {
          const savedStaffId = localStorage.getItem(`order_${order.id}`);
          if (savedStaffId) {
            return { ...order, assignedStaffId: parseInt(savedStaffId, 10) };
          }
          return order;
        });

        setDeliveries(shippingOrders);
        const staffAndAdmins = allAccounts.filter(acc => hasRole(acc, 'ROLE_STAFF'));
        setAllStaff(staffAndAdmins);
      } catch (err) {
        setError(err.message);
        addNotification(`Lỗi tải dữ liệu: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isAuthLoading, navigate, addNotification]);

  const filteredDeliveries = deliveries.filter(d => {
    const assignedStaffMember = allStaff.find(s => s.id === d.assignedStaffId);
    const staffName = assignedStaffMember?.fullName;
    const matchesStaff = selectedStaffNames.length === 0 || (staffName && selectedStaffNames.includes(staffName));
    const matchesKeyword = d.receiverFullName.toLowerCase().includes(searchKeyword.toLowerCase()) || d.orderCode.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesStaff && matchesKeyword;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStaffSelectChange = async (orderId, newStaffIdStr) => {
    const newStaffId = newStaffIdStr ? parseInt(newStaffIdStr, 10) : null;

    // Cập nhật giao diện trước
    setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, assignedStaffId: newStaffId } : d));

    // SỬA: Lưu vào Local Storage
    if (newStaffId) {
      localStorage.setItem(`order_${orderId}`, newStaffId);
    } else {
      localStorage.removeItem(`order_${orderId}`); // Xóa nếu bỏ chọn nhân viên
    }

    addNotification('Đã lưu lựa chọn nhân viên vào trình duyệt.', 'info');
    // Lưu ý: Phần gọi API vẫn được giữ lại để bạn có thể kích hoạt lại trong tương lai nếu cần
    /*
    try {
      const response = await fetch(`.../assign`, { ... });
      if (!response.ok) throw new Error('API Error');
      addNotification('Giao việc thành công!', 'success');
    } catch (error) {
      addNotification(error.message, 'error');
      // Nếu có lỗi, khôi phục lại trạng thái cũ
      setDeliveries(originalDeliveries);
    }
    */
  };

  const handleStatusChange = async (id, newStatus) => {
    setDeliveries(prev => prev.map(order => order.id === id ? { ...order, orderStatus: newStatus } : order));

    if (newStatus === 'Delivered') {
      // SỬA: Xóa khỏi Local Storage khi đơn hàng hoàn thành
      localStorage.removeItem(`order_${id}`);
      addNotification(`Đã hoàn thành đơn hàng. Xóa phân công khỏi bộ nhớ trình duyệt.`, 'success');
      // Xóa đơn hàng khỏi danh sách trên giao diện
      setTimeout(() => setDeliveries(prev => prev.filter(d => d.id !== id)), 300);
    } else {
      addNotification(`Cập nhật trạng thái thành ${newStatus}`, 'success');
    }
  };

  const handleStaffFilterChange = (staffName) => setSelectedStaffNames(prev => prev.includes(staffName) ? prev.filter(s => s !== staffName) : [...prev, staffName]);
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
                {allStaff.map((staff) => (
                    <label key={staff.id} className="filter-option-item">
                      <input type="checkbox" className="filter-checkbox" checked={selectedStaffNames.includes(staff.fullName)} onChange={() => handleStaffFilterChange(staff.fullName)} />
                      <span className="filter-label">{staff.fullName}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Tìm mã đơn hoặc tên KH..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
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
              <th className="col-status">Trạng thái</th>
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
                    <select value={d.assignedStaffId || ''} onChange={(e) => handleStaffSelectChange(d.id, e.target.value)} className="staff-dropdown">
                      <option value="">-- Chọn NV --</option>
                      {allStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>{staff.fullName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="action-cell">
                    <div className="action-icons">
                      {d.orderStatus === 'Pending' && d.assignedStaffId && (
                          <FaShippingFast className="icon start-delivery" title="Bắt đầu giao" onClick={() => handleStatusChange(d.id, 'Shipping')} />
                      )}
                      {d.orderStatus === 'Shipping' && (
                          <FaCheckCircle className="icon complete" title="Hoàn thành đơn" onClick={() => handleStatusChange(d.id, 'Complete')} />
                      )}
                    </div>
                    <span className={`status-badge status-${d.orderStatus.toLowerCase()}`}>{d.orderStatus}</span>
                  </td>
                </tr>
            ))}
            {filteredDeliveries.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Không có đơn hàng phù hợp.</td></tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default DeliveryManagement;