import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { CiSearch } from 'react-icons/ci';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Helmet } from 'react-helmet-async';

const statusDisplayMap = {
  'Pending': 'Đang chuẩn bị',
  'Paid': 'Đang chuẩn bị',
  'Cash': 'Đang chuẩn bị',
  'Shipping': 'Đang giao',
  'Complete': 'Đã nhận',
  'Cancel': 'Đã hủy'
};

// Define the options for the dropdown menu
const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Shipping', label: 'Shipping' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Cancel', label: 'Cancel' }
];

const OrdersManagement = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotification();

  // ✅ NEW: State to track which order is being edited
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      addNotification('Vui lòng đăng nhập để truy cập.', 'error');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ver0.0.1/staff/orders', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Không thể tải đơn hàng.');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        addNotification(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, isAuthLoading, addNotification]);

  const handleStatusChange = async (id, newStatus) => {
    const originalOrders = [...orders];
    setOrders(prevOrders =>
        prevOrders.map(order =>
            order.id === id ? { ...order, orderStatus: newStatus } : order
        )
    );
    // Exit edit mode immediately after selection
    setEditingOrderId(null);

    try {
      const response = await fetch(`/api/ver0.0.1/staff/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Cập nhật trạng thái thất bại.');
      }
      addNotification('Cập nhật trạng thái thành công!', 'success');
    } catch (error) {
      addNotification(error.message, 'error');
      setOrders(originalOrders); // Revert on error
    }
  };

  const filteredOrders = orders.filter(order =>
      order.orderCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.receiverFullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.receiverPhoneNumber?.includes(searchKeyword)
  );

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
      <div className="orders-page">
        <Helmet>
          <title>Danh Sách Đơn Hàng</title>
        </Helmet>
        <h2>Danh Sách Đơn Hàng</h2>
        <div className="search-bar">
          <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, SĐT..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button><CiSearch size={20} /></button>
        </div>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Tên khách hàng</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Ngày đặt</th>
              <th>Tổng thanh toán</th>
              <th>Vận chuyển</th>
              <th>Trạng thái</th>
            </tr>
            </thead>
            <tbody>
            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderCode}</td>
                      <td>{order.receiverFullName}</td>
                      <td>{order.receiverPhoneNumber}</td>
                      <td>{order.fullShippingAddress}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                      <td>{order.totalAmount.toLocaleString()}₫</td>
                      <td>{order.shippingMethodName}</td>
                      <td>
                        {/* ✅ FIX: Conditionally render a dropdown or a chip */}
                        {editingOrderId === order.id ? (
                            <select
                                className="status-select-inline"
                                value={order.orderStatus}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                onBlur={() => setEditingOrderId(null)} // Exit edit mode when clicking away
                                autoFocus // Automatically focus the dropdown
                            >
                              {statusOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                        ) : (
                            <div
                                className={`order-status-chip status-${order.orderStatus?.toLowerCase()}`}
                                onClick={() => setEditingOrderId(order.id)} // Enter edit mode on click
                                title="Click để thay đổi"
                            >
                              {statusDisplayMap[order.orderStatus] || order.orderStatus}
                            </div>
                        )}
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '16px' }}>
                    Không có đơn hàng nào.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default OrdersManagement;