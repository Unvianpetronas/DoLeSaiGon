import React from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <>
      <h2>Dashboard Quản Trị</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card blue"><h3>Sản phẩm</h3><p>125</p></div>
        <div className="dashboard-card green"><h3>Đơn hàng</h3><p>320</p></div>
        <div className="dashboard-card yellow"><h3>Khách hàng</h3><p>87</p></div>
        <div className="dashboard-card red"><h3>Doanh thu</h3><p>124.000.000₫</p></div>
      </div>
    </>
  );
}
