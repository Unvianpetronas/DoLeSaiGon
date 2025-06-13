import React from "react";
import "./Details.css";

export default function Details() {
  return (
    <div className="details-container">
      <div className="order-status">
        <h2>Trạng thái đơn hàng</h2>
        <div className="status-steps">
          <span className="step active">Đang chuẩn bị</span>
          <span className="arrow">→</span>
          <span className="step">Đang giao</span>
          <span className="arrow">→</span>
          <span className="step">Đã nhận</span>
        </div>
      </div>

      <div className="order-info">
        <h2>Thông tin đơn hàng</h2>
        <div className="product-info">
          <img
            src="https://product.hstatic.net/1000280685/product/xoi-ngu-sac-hinh-hoa_9cb05f7df1c248e3aef358ec1d0e39f2_grande.jpg"
            alt="Xôi ngũ sắc"
            className="product-img"
          />
          <div className="product-details">
            <p className="product-name">Xôi ngũ sắc trung bày hình hoa</p>
            <p className="product-price">₫99.000</p>
            <p className="product-qty">x1</p>
          </div>
        </div>

        <div className="price-breakdown">
          <div className="line-item">
            <span>Tổng tiền hàng</span>
            <span>₫99.000</span>
          </div>
          <div className="line-item">
            <span>Phí vận chuyển</span>
            <span>₫20.000</span>
          </div>
          <div className="line-item">
            <span>Ưu đãi</span>
            <span>₫20.000</span>
          </div>
          <div className="total-line">
            <strong>Thành tiền</strong>
            <strong>₫99.000</strong>
          </div>
        </div>

        <div className="order-meta">
          <p><strong>Mã đơn hàng:</strong> 214354675XFH</p>
          <p><strong>Phương thức thanh toán:</strong> Chuyển khoản</p>
          <p>
            <strong>Địa chỉ nhận hàng:</strong> 546 Nguyễn Văn A, p1, q7, tp.hcm
          </p>
          <p>
            <strong>Người nhận:</strong> Lê Văn A ( +84 123 456 789 )
          </p>
        </div>
      </div>
    </div>
  );
}
