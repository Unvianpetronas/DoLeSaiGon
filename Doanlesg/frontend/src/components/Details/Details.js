// src/pages/Details.js
import React from "react";
import { useParams } from "react-router-dom";
import "./Details.css";
import detailsImg from '../../assets/Xoingusac.png';

const orders = [
  {
    id: '214354675XFH',
    date: '2025-06-23',
    status: 'Đang giao',
    items: [
      { name: 'Xôi ngũ sắc trưng bày hình hoa mai năm cánh + Mâm trái cây tam sắc', quantity: 1, price: 99000 },
      { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
    ],
    address: "546 Nguyễn Văn A, p1, q7, tp.hcm",
    receiver: "Lê Văn A",
    phone: "+84 123 456 789",
    payment: "Chuyển khoản",
    shipping: 20000,
    discount: 20000
  },
   {
      id: 'DH001',
      date: '2025-06-23',
      status: 'Đang giao',
      items: [
        { name: 'Xôi ngũ sắc trưng bày hình hoa mai năm cánh + Mâm trái cây tam sắc', quantity: 1, price: 99000 },
        { name: 'Tháp bánh trung thu', quantity: 1, price: 350000 },
      ],
      address: "546 Nguyễn Văn A, p1, q7, tp.hcm",
      receiver: "Lê Văn A",
      phone: "+84 123 456 789",
      payment: "Chuyển khoản",
      shipping: 20000,
      discount: 20000
    },
  {
    id: 'DH003',
    date: '2025-06-24',
    status: 'Đang chuẩn bị',
    items: [{ name: 'Mâm lễ chay', quantity: 1, price: 500000 }],
    address: "Số 1 Võ Văn Ngân, Thủ Đức, HCM",
    receiver: "Nguyễn B",
    phone: "+84 999 888 777",
    payment: "Tiền mặt",
    shipping: 0,
    discount: 0
  },
  {
    id: 'DH002',
    date: '2025-06-24',
    status: 'Đã nhận',
    items: [{ name: 'Mâm lễ chay', quantity: 1, price: 500000 }],
    address: "Số 1 Võ Văn Ngân, Thủ Đức, HCM",
    receiver: "Nguyễn B",
    phone: "+84 999 888 777",
    payment: "Tiền mặt",
    shipping: 0,
    discount: 0
  }
];

export default function Details() {
  const { orderId } = useParams();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return <div className="details-container"><h2>Không tìm thấy đơn hàng</h2></div>;
  }

  const getStepClass = (stepName) => {
    return order.status === stepName ? "step active" : "step inactive";
  };

  // ✅ Tính tổng tiền hàng dựa trên các item
  const calculateSubTotal = () => {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return (calculateSubTotal() + order.shipping - order.discount).toLocaleString();
  };

  return (
    <div className="details-container">
      <div className="order-status">
        <h2>Trạng thái đơn hàng</h2>
        <div className="status-steps">
          <span className={getStepClass("Đang chuẩn bị")}>Đang chuẩn bị</span>
          <span className="arrow">→</span>
          <span className={getStepClass("Đang giao")}>Đang giao</span>
          <span className="arrow">→</span>
          <span className={getStepClass("Đã nhận")}>Đã nhận</span>
        </div>
      </div>

      <hr className="divider" />
      <div className="order-info">
        <h2>Thông tin đơn hàng</h2>

        <div className="order-meta">
          <p><strong>Mã đơn hàng:</strong> {order.id}</p>
          <p><strong>Phương thức thanh toán:</strong> {order.payment}</p>
          <p><strong>Địa chỉ nhận hàng:</strong> {order.address}</p>
          <p><strong>Người nhận:</strong> {order.receiver} ({order.phone})</p>
        </div>

        <hr className="divider" />
        {order.items.map((item, index) => (
          <div className="product-row" key={index}>
            <img src={detailsImg} alt={item.name} className="product-img" />
            <div className="product-name">{item.name}</div>
            <div className="product-details">
              <span className="product-qty">x{item.quantity}</span>
              <span className="product-price">{(item.price * item.quantity).toLocaleString()}₫</span>
            </div>
          </div>
        ))}

        <hr className="divider" />
        <div className="price-breakdown">
          <div className="line-item">
            <span>Tổng tiền hàng</span>
            <span>{calculateSubTotal().toLocaleString()}₫</span>
          </div>
          <div className="line-item">
            <span>Phí vận chuyển</span>
            <span>{order.shipping.toLocaleString()}₫</span>
          </div>
          <div className="line-item">
            <span>Ưu đãi</span>
            <span>-{order.discount.toLocaleString()}₫</span>
          </div>
         <hr className="divider" />
         <div className="total-line">
           <span className="total-label">Thành tiền</span>
           <span className="total-value">{calculateTotal()}₫</span>
         </div>

        </div>


      </div>
    </div>
  );
}
