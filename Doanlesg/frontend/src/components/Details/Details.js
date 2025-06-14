import React from "react";
import "./Details.css";
import detailsImg from '../../assets/Xoingusac.png';

export default function Details() {
  const status = "Đang giao"; // Có thể là: "Đang chuẩn bị", "Đang giao", "Đã nhận"

  // Hàm xác định xem step hiện tại có đang là trạng thái không
  const getStepClass = (stepName) => {
    return status === stepName ? "step active" : "step inactive";
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

      <div className="order-info">
        {/* phần thông tin đơn hàng giữ nguyên */}
        <h2>Thông tin đơn hàng</h2>
        <div className="product-info">
          <img
            src={detailsImg}
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
          <p><strong>Địa chỉ nhận hàng:</strong> 546 Nguyễn Văn A, p1, q7, tp.hcm</p>
          <p><strong>Người nhận:</strong> Lê Văn A ( +84 123 456 789 )</p>
        </div>
      </div>
    </div>
  );
}
