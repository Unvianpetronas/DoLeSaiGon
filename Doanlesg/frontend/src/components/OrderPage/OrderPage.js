import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './OrderPage.css';

// --- THIS IS THE FIX ---
// 1. The status map now uses an array for "Đang chuẩn bị"
const statusMap = {
  'Đang chuẩn bị': ['Pending', 'Paid', 'Cash'], // Will show orders with any of these statuses
  'Đang giao': ['Shipping'],
  'Đã nhận': ['Complete'],
  'Đã hủy': ['Cancel']
};

// This reverse map helps display the correct Vietnamese name
const reverseStatusMap = {
  'Pending': 'Đang chuẩn bị',
  'Paid': 'Đang chuẩn bị',
  'Cash': 'Đang chuẩn bị',
  'Shipping': 'Đang giao',
  'Complete': 'Đã nhận',
  'Cancel': 'Đã hủy'
};

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Đang chuẩn bị');

  const { user, isLoading: isAuthLoading } = useAuth();

  const steps = ['Đang chuẩn bị', 'Đang giao', 'Đã nhận', 'Đã hủy'];

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setError("Vui lòng đăng nhập để xem đơn hàng của bạn.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8080/api/ver0.0.1/orders', {
          credentials: 'include',
        });
        if (response.status === 401) throw new Error("Phiên đăng nhập đã hết hạn.");
        if (!response.ok) throw new Error('Không thể tải danh sách đơn hàng.');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders().then();
  }, [user, isAuthLoading]);

  // 2. The filtering logic is now more robust
  const backendStatusesToFilter = statusMap[selectedStatus];
  const filteredOrders = orders.filter((order) =>
      backendStatusesToFilter.includes(order.orderStatus)
  );

  if (loading) {
    return <div className="order-page"><h1>Đơn hàng của bạn</h1><p>Đang tải...</p></div>;
  }

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

        {error && <div className="order-error-message">{error}</div>}

        {!error && (
            filteredOrders.length === 0 ? (
                <div className="no-orders-found">
                  <p>Không có đơn hàng nào ở trạng thái "{selectedStatus}".</p>
                </div>
            ) : (
                filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )
        )}
      </div>
  );
}

function OrderCard({ order }) {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/details/${order.id}`);

  // Use the reverse map to always show the correct UI text
  const displayStatus = reverseStatusMap[order.orderStatus] || order.orderStatus;

  return (
      <div className="order-card" onClick={handleClick}>
        <div className="order-header">
          <div><strong>Mã đơn:</strong> {order.orderCode}</div>
          <div><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</div>
          <div className={`order-status-chip status-${order.orderStatus?.toLowerCase()}`}>{displayStatus}</div>
        </div>
        <div className="order-body"><p>Xem chi tiết đơn hàng</p></div>
        <div className="order-total">
          <span>Tổng cộng:</span>
          <strong>{order.totalAmount.toLocaleString()}₫</strong>
        </div>
      </div>
  );
}