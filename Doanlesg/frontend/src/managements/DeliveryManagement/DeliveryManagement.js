import React, { useState, useEffect, useRef } from 'react';
import './DeliveryManagement.css';
import { FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';

const initialDeliveryData = [
  {
    id: 1,
    code: '02982',
    customerName: 'ABC',
    phone: '0936482910',
    address: 'Thảo Điền, Thủ Đức',
    staff: 'Nguyễn Văn A',
    confirmed: false
  },
  {
    id: 2,
    code: '02983',
    customerName: 'Nguyễn Văn B',
    phone: '0912345678',
    address: 'Quận 1, TP.HCM',
    staff: 'Trần Thị B',
    confirmed: true
  },
  {
    id: 3,
    code: '02984',
    customerName: 'Lê Thị C',
    phone: '0987654321',
    address: 'Bình Thạnh, TP.HCM',
    staff: 'Nguyễn Văn A',
    confirmed: false
  }
];

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveryData);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allStaff, setAllStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const uniqueStaff = [...new Set(deliveries.map(d => d.staff))];
    setAllStaff(uniqueStaff);
    setSelectedStaff(prev =>
      prev.length === 0 ? uniqueStaff : prev.filter(s => uniqueStaff.includes(s))
    );
  }, [deliveries]);

  useEffect(() => {
    const result = deliveries.filter(
      (d) =>
        selectedStaff.includes(d.staff) &&
        (d.customerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
         d.code.includes(searchKeyword))
    );
    setFilteredDeliveries(result);
  }, [deliveries, selectedStaff, searchKeyword]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmToggle = (id) => {
    const updated = deliveries.map((d) =>
      d.id === id ? { ...d, confirmed: !d.confirmed } : d
    );
    setDeliveries(updated);
  };

  const handleDelete = (id) => {
    setDeliveries(deliveries.filter((d) => d.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Mã đơn hàng', 'Tên KH', 'SĐT', 'Địa chỉ', 'Nhân viên', 'Đã xác nhận'];
    const rows = filteredDeliveries.map(d => [
      d.code, d.customerName, d.phone, d.address, d.staff, d.confirmed ? '✔' : '✘'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'don_hang_giao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStaffChange = (staff) => {
    setSelectedStaff(prev =>
      prev.includes(staff)
        ? prev.filter(s => s !== staff)
        : [...prev, staff]
    );
  };

  const handleSelectAll = () => {
    setSelectedStaff(allStaff);
  };

  const handleInvert = () => {
    const inverted = allStaff.filter(s => !selectedStaff.includes(s));
    setSelectedStaff(inverted);
  };

const handleStaffSelectChange = (id, newStaff) => {
  const updated = deliveries.map(d =>
    d.id === id ? { ...d, staff: newStaff } : d
  );
  setDeliveries(updated);
};

  return (
    <div className="delivery-management">
      <h2>Danh Sách Đơn Giao Hàng</h2>

      <div className="admin-controls">
        <div className="filter-container" ref={filterRef}>
          <button className="btn pink" onClick={() => setShowFilter(prev => !prev)}>FILTER</button>
          <div className={`filter-popup ${showFilter ? 'show' : ''}`}>
            <div className="filter-commands">
              <span className="link" onClick={handleSelectAll}>Select All</span>
              <span className="link" onClick={handleInvert}>Invert</span>
            </div>
            <div className="filter-options">
              {allStaff.map((staff, idx) => (
                <label key={idx} className="filter-option-item">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedStaff.includes(staff)}
                    onChange={() => handleStaffChange(staff)}
                  />
                  <span className="filter-label">{staff}</span>
                </label>
              ))}
              {allStaff.length === 0 && (
                <div className="no-category">Không có nhân viên nào.</div>
              )}
            </div>
          </div>
        </div>

        <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm mã KH hoặc tên nhân viên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button><CiSearch size={20} /></button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-product-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Mã đơn hàng</th>
              <th style={{ width: '150px' }}>Tên KH</th>
              <th style={{ width: '120px' }}>SĐT</th>
              <th style={{ width: '220px' }}>Địa chỉ</th>
              <th style={{ width: '150px' }}>Nhân viên</th>
              <th style={{ width: '90px' }}>Confirm</th>
              <th style={{ width: '100px' }}>Tính năng</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.code}</td>
                <td>{d.customerName}</td>
                <td>{d.phone}</td>
                <td>{d.address}</td>
                <td>
                  <select
                    value={d.staff}
                    onChange={(e) => handleStaffSelectChange(d.id, e.target.value)}
                    className="staff-dropdown"
                  >
                    {allStaff.map((name, idx) => (
                      <option key={idx} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    type="checkbox"
                    checked={d.confirmed}
                    onChange={() => handleConfirmToggle(d.id)}
                  />
                </td>
                <td>
                  <FaTrashAlt className="icon delete" title="Xóa" onClick={() => handleDelete(d.id)} />
                </td>
              </tr>
            ))}
            {filteredDeliveries.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryManagement;