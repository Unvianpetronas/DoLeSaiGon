import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { CiSearch } from 'react-icons/ci';

const OrdersManagement = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Gọi API lấy toàn bộ đơn hàng
  const fetchAllOrders = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:8080/api/ver0.0.1/staff/orders', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.status === 403) {
        throw new Error('Bạn không có quyền truy cập.');
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gọi API tìm kiếm đơn hàng
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchAllOrders();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(
        `http://localhost:8080/staff/orders/search?keyword=${encodeURIComponent(searchKeyword)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (res.status === 403) {
        throw new Error('Bạn không có quyền tìm kiếm.');
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi tìm kiếm đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load ngay khi mở trang
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // ✅ Cập nhật trạng thái local
  const handleStatusChange = (id, newStatus) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updated);
  };

  return (
    <div className="orders-page">
      <h2>Danh Sách Đơn Hàng</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã, tên, SĐT..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>
          <CiSearch size={20} />
        </button>
      </div>

      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : errorMessage ? (
        <p style={{ color: 'red', marginTop: '12px' }}>❌ {errorMessage}</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Mã khách hàng</th>
                <th>Tên khách hàng</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ngày đặt</th>
                <th>Tổng thanh toán</th>
                <th>Phương thức nhận</th>
                <th>Trạng thái đơn</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer?.id || 'N/A'}</td>
                    <td>{order.customer?.fullName || 'Chưa rõ'}</td>
                    <td>{order.customer?.phoneNumber || 'N/A'}</td>
                    <td>{order.address || 'N/A'}</td>
                    <td>{order.date || 'N/A'}</td>
                    <td>{order.total || 'N/A'}</td>
                    <td>{order.receiveMethod || 'N/A'}</td>
                    <td>
                      <select
                        className={`status-select ${
                          order.status === 'Đang chuẩn bị'
                            ? 'prepare'
                            : order.status === 'Đang giao'
                            ? 'shipping'
                            : 'delivered'
                        }`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Đã giao">Đã giao</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '16px' }}>
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
