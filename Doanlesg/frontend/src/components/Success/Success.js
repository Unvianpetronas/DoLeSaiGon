import React from 'react';
import './Success.css';
import { useNavigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();

  // Giả lập ID đơn hàng vừa đặt
  const orderId = '214354675XFH';

  return (
    <div className="success-page">

      <button
        className="success-btn"
        onClick={() => navigate(`/details/${orderId}`)}
      >
        Xem chi tiết đơn hàng
      </button>

    </div>
  );
}

export default Success;
