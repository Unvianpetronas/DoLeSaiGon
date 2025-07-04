import React, { useState } from 'react';
import './OrdersManagement.css';
import { CiSearch } from 'react-icons/ci';

const initialOrders = [
  {
    id: '387271',
    customerId: '79382',
    name: 'Nguyễn Văn A',
    phone: '0294857362',
    address: 'Khu Công Nghệ Cao, Thủ Đức',
    date: '12/01/2025',
    total: '1.031.000',
    receiveMethod: 'Giao tận nơi',
    status: 'Đang chuẩn bị',
  },
  {
    id: '387272',
    customerId: '79383',
    name: 'Trần Thị B',
    phone: '0984828472',
    address: 'Thảo Điền, Quận 2',
    date: '20/2/2025',
    total: '2.000.000',
    receiveMethod: 'Đến lấy',
    status: 'Đang giao',
  },
  {
    id: '387273',
    customerId: '79384',
    name: 'Lê Văn C',
    phone: '0947563948',
    address: 'Đinh Tiên Hoàng, Quận 1',
    date: '30/1/2025',
    total: '1.323.000',
    receiveMethod: 'Đến lấy',
    status: 'Đã giao',
  },
  {
    id: '387274',
    customerId: '79385',
    name: 'Phạm Ngọc D',
    phone: '09375846372',
    address: 'Lê Văn Chí, Thủ Đức',
    date: '26/09/2025',
    total: '4.222.000',
    receiveMethod: 'Giao tận nơi',
    status: 'Đã giao',
  },
];

const OrdersManagement = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [orders, setOrders] = useState(initialOrders);

  // ✅ Lọc theo tên khách hàng
const filteredOrders = orders.filter((order) => {
  const keyword = searchKeyword.toLowerCase();
  return (
    order.id.toLowerCase().includes(keyword) ||
    order.name.toLowerCase().includes(keyword) ||
    order.phone.toLowerCase().includes(keyword)
  );
});

  // ✅ Cập nhật trạng thái đơn hàng
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
          placeholder="Tìm kiếm..."
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
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerId}</td>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.address}</td>
                <td>{order.date}</td>
                <td>{order.total}</td>
                <td>{order.receiveMethod}</td>
                <td>
                  <select
                    className={`status-select ${order.status === 'Đang chuẩn bị' ? 'prepare' : order.status === 'Đang giao' ? 'shipping' : 'delivered'}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '16px' }}>
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

export default OrdersManagement;
