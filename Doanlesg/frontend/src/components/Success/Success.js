import React from 'react';
import './Success.css';
import { useNavigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();

  // Giả lập ID đơn hàng vừa đặt
  const orderId = '214354675XFH';

  return (
    <div className="success-page">
      <div className="success-checkmark">✅</div>
      <h1>Đơn của bạn đã đặt thành công</h1>
      <button
        className="success-btn"
        onClick={() => navigate(`/details/${orderId}`)}
      >
        Xem chi tiết đơn hàng
      </button>
      <div className="success-message">
        <p>Cảm ơn quý khách đã ủng hộ sản phẩm của chúng tôi.</p>
      </div>
    </div>
  );
}

export default Success;
