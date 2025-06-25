// src/pages/OrderPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const orders = [
  {
    id: 'DH001',
    date: '2025-06-23',
    status: 'Đang giao',
    total: 850000,
    items: [
      { name: 'Mâm ngũ quả', quantity: 1, price: 500000 },
      { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
    ],
  },
  {
    id: 'DH111',
    date: '2025-06-23',
    status: 'Đang giao',
    total: 850000,
    items: [
      { name: 'Mâm ngũ quả', quantity: 1, price: 500000 },
      { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
    ],
  },
  {
    id: 'DH021',
    date: '2025-06-23',
    status: 'Đang giao',
    total: 850000,
    items: [
      { name: 'Mâm ngũ quả', quantity: 1, price: 500000 },
      { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
    ],
  },
  {
    id: 'DH401',
    date: '2025-06-23',
    status: 'Đang giao',
    total: 850000,
    items: [
      { name: 'Mâm ngũ quả', quantity: 1, price: 500000 },
      { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
    ],
  },
  {
    id: 'DH002',
    date: '2025-06-20',
    status: 'Đã nhận',
    total: 1200000,
    items: [{ name: 'Mâm tam sắc', quantity: 1, price: 1200000 }],
  },
  {
    id: 'DH003',
    date: '2025-06-24',
    status: 'Đang chuẩn bị',
    total: 500000,
    items: [{ name: 'Mâm lễ chay', quantity: 1, price: 500000 }],
  },
];

export default function OrderPage() {
  const [selectedStatus, setSelectedStatus] = useState('Đang chuẩn bị');
  const steps = ['Đang chuẩn bị', 'Đang giao', 'Đã nhận'];

  const filteredOrders = orders.filter((order) => order.status === selectedStatus);

  return (
    <div className="order-page">
      <h1>Đơn hàng của bạn</h1>

      <div className="steps">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`step ${selectedStatus === step ? 'active' : ''}`}
              onClick={() => setSelectedStatus(step)}
            >
              {step}
            </div>
            {index < steps.length - 1 && <div className="arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p>Không có đơn hàng nào ở trạng thái "{selectedStatus}".</p>
      ) : (
        filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/details/${order.id}`);
  };

  return (
    <div className="order-card" onClick={handleClick}>
      <div className="order-header">
        <strong>Mã đơn:</strong> {order.id} &nbsp; | &nbsp;
        <strong>Ngày đặt:</strong> {order.date} &nbsp; | &nbsp;
        <strong>Trạng thái:</strong> {order.status}
      </div>
      <ul className="order-items">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name} x {item.quantity} - {item.price.toLocaleString()}₫
          </li>
        ))}
      </ul>
      <div className="order-total">Tổng cộng: {order.total.toLocaleString()}₫</div>
    </div>
  );
}
