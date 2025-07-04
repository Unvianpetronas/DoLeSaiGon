import React, { useState, useEffect } from 'react';
import './CustomersManagement.css';
import { CiSearch } from 'react-icons/ci';

const initialCustomerData = [
  { id: 1, code: 'KH001', name: 'Nguyễn Văn A', phone: '0928472839', email: 'admin@gmail.com', address: 'Bình Thạnh, Hồ Chí Minh' },
  { id: 2, code: 'KH002', name: 'Trần Thị A', phone: '0987654321', email: 'atrangthi@gmail.com', address: 'Thủ Đức, Hồ Chí Minh' },
];

const CustomersManagement = () => {
  const [customers] = useState(initialCustomerData);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => {
    const result = customers.filter(
      (c) => c.phone.includes(searchPhone)
    );
    setFilteredCustomers(result);
  }, [customers, searchPhone]);

const handleExportCSV = () => {
  const headers = ['Mã KH', 'Họ và tên', 'Số điện thoại', 'Email', 'Địa chỉ'];
  const rows = filteredCustomers.map(c => [
    c.code, c.name, c.phone, c.email, c.address
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'danh_sach_khach_hang.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="customers-management">
      <h2>Danh Sách Khách Hàng</h2>

      <div className="admin-controls">
        <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Lọc theo số điện thoại..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
          />
          <button><CiSearch size={20} /></button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.address}</td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Không tìm thấy khách hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersManagement;