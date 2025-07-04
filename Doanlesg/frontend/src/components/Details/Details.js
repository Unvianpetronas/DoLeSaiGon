import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Added cancel icon
import './Details.css';

// --- THIS IS THE FIX ---

// 1. Define the visual steps for the tracker in the UI
const visualSteps = [
  { name: 'Đang chuẩn bị', icon: <FaBoxOpen /> },
  { name: 'Đang giao', icon: <FaTruck /> },
  { name: 'Đã nhận', icon: <FaCheckCircle /> }
];

// 2. Create a mapping from the BACKEND status string to the step INDEX
const statusToIndex = {
  'Pending': 0,
  'Paid': 0,
  'Cash': 0,
  'Shipping': 1,
  'Complete': 2,
  'Cancel': -1 // A special index for cancelled orders
};

// 3. Create a map to get the display name for any status
const statusDisplayName = {
  'Pending': 'Đang chuẩn bị',
  'Paid': 'Đang chuẩn bị',
  'Cash': 'Đang chuẩn bị',
  'Shipping': 'Đang giao',
  'Complete': 'Đã nhận',
  'Cancel': 'Đã hủy'
};


export default function Details() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8080/api/ver0.0.1/orders/${orderId}`, {
          credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error('Bạn không có quyền xem đơn hàng này.');
        }
        if (!response.ok) {
          throw new Error(`Không tìm thấy đơn hàng với mã: ${orderId}`);
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails().then();
  }, [orderId]);

  if (loading) {
    return <div className="details-container"><p>Đang tải chi tiết đơn hàng...</p></div>;
  }

  if (error) {
    return <div className="details-container error-message"><h2>Lỗi</h2><p>{error}</p></div>;
  }

  if (!order) {
    return <div className="details-container"><h2>Không có thông tin đơn hàng</h2></div>;
  }

  // 4. Use the maps to get the current step index and display name
  const currentStepIndex = statusToIndex[order.orderStatus] ?? -1;
  const displayStatus = statusDisplayName[order.orderStatus] || order.orderStatus;

  return (
      <div className="details-container">
        <h2>Trạng thái đơn hàng</h2>

        {/* 5. Conditionally render the status tracker or a "Cancelled" message */}
        {order.orderStatus === 'Cancel' ? (
            <div className="status-steps-cancelled">
              <FaTimesCircle />
              <span>Đơn hàng đã bị hủy</span>
            </div>
        ) : (
            <div className="status-steps">
              {visualSteps.map((step, index) => (
                  <React.Fragment key={step.name}>
                    <div className={`step ${index <= currentStepIndex ? 'active' : ''}`}>
                      {step.icon}
                      <span className="step-label">{step.name}</span>
                    </div>
                    {index < visualSteps.length - 1 && <span className="arrow">→</span>}
                  </React.Fragment>
              ))}
            </div>
        )}

        <hr className="divider" />

        <h2>Thông tin đơn hàng</h2>
        <div className="order-meta">
          <p><strong>Mã đơn hàng:</strong> {order.orderCode}</p>
          <p><strong>Trạng thái:</strong> {displayStatus}</p>
          <p><strong>Phương thức thanh toán:</strong> {order.paymentMethodName}</p>
          <p><strong>Địa chỉ nhận hàng:</strong> {order.fullShippingAddress}</p>
          <p><strong>Người nhận:</strong> {order.receiverFullName} ({order.receiverPhoneNumber})</p>
        </div>

        <hr className="divider" />

        {order.orderItems?.map(item => (
            <div className="product-row" key={item.productId}>
              <img
                  src={`/products/${item.productId}.png`}
                  alt={item.productName}
                  className="product-img"
                  onError={(e) => { e.target.src = '/products/default.png'; }}
              />
              <div className="product-name">{item.productName}</div>
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
            <span>{order.itemsSubtotal.toLocaleString()}₫</span>
          </div>
          <div className="line-item">
            <span>Phí vận chuyển</span>
            <span>{order.shippingFee.toLocaleString()}₫</span>
          </div>
          {order.voucherDiscount > 0 && (
              <div className="line-item">
                <span>Ưu đãi</span>
                <span className="discount-value">-{order.voucherDiscount.toLocaleString()}₫</span>
              </div>
          )}
          <hr className="divider-sub" />
          <div className="total-line">
            <span className="total-label">Thành tiền</span>
            <span className="total-value">{order.totalAmount.toLocaleString()}₫</span>
          </div>
        </div>
      </div>
  );
}