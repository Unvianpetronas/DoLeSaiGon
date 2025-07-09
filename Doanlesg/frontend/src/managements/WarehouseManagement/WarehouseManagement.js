import React, { useState, useEffect } from 'react';
import './WarehouseManagement.css';
import { CiSearch } from 'react-icons/ci';

export default function WarehouseManagement() {
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const isAdmin = true;

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  // ✅ Load dữ liệu hôm nay nếu còn hợp lệ
  useEffect(() => {
    const today = getTodayKey();
    const savedData = localStorage.getItem('warehouse-stock');
    const expireDate = localStorage.getItem('warehouse-stock-expire');

    if (expireDate === today && savedData) {
      setStock(JSON.parse(savedData));
    } else {
      localStorage.removeItem('warehouse-stock');
      localStorage.removeItem('warehouse-stock-expire');
      setStock([]);
    }
  }, []);

  // ✅ Tự động lưu và set ngày hết hạn
  useEffect(() => {
    if (stock.length > 0) {
      const today = getTodayKey();
      localStorage.setItem('warehouse-stock', JSON.stringify(stock));
      localStorage.setItem('warehouse-stock-expire', today);
    }
  }, [stock]);

  const handleCreate = () => setShowModal(true);

  const handleStatusChange = (id, newStatus) => {
    const updated = stock.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setStock(updated);
  };

  const handleNoteChange = (id, newNote) => {
    const updated = stock.map(item =>
      item.id === id ? { ...item, note: newNote } : item
    );
    setStock(updated);
  };

  const filtered = stock.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    const newItems = [];

    for (let i = 0; i < 5; i++) {
      const name = document.querySelector(`input[name="name-${i}"]`)?.value.trim();
      const unit = document.querySelector(`input[name="unit-${i}"]`)?.value.trim();
      const quantity = parseFloat(document.querySelector(`input[name="quantity-${i}"]`)?.value);
      const price = parseFloat(document.querySelector(`input[name="price-${i}"]`)?.value);

      if (name && unit && !isNaN(quantity) && !isNaN(price)) {
        const total = quantity * price;
        newItems.push({
          id: Date.now() + i,
          name,
          unit,
          quantity,
          price,
          total,
          warehouse: quantity,
          status: '',
          note: ''
        });
      }
    }

    if (newItems.length > 0) {
      const updatedStock = [...stock, ...newItems];
      setStock(updatedStock);
    }

    setShowModal(false);
  };

  return (
    <div className="warehouse-page">
      <h2>Danh Sách Kiểm Kê Nhập Kho</h2>

      <div className="admin-controls">
        {isAdmin && (
          <button className="btn green" onClick={handleCreate}>CREATE</button>
        )}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm nguyên liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button><CiSearch size={20} /></button>
        </div>
      </div>

      <div className="warehouse-table-wrapper">
        <table className="warehouse-table">
          <thead>
            <tr>
              <th>Nguyên liệu</th>
              <th>Đơn vị</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tổng thanh toán</th>
              <th>Tổng tồn kho</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toLocaleString()}</td>
                <td>{item.total.toLocaleString()}</td>
                <td>{item.warehouse}</td>
                <td>
                  <select
                    className={`status-select ${item.status === 'Đủ' ? 'enough' : item.status === 'Thừa' ? 'over' : item.status === 'Thiếu' ? 'lack' : ''}`}
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="">--</option>
                    <option value="Đủ">Đủ</option>
                    <option value="Thừa">Thừa</option>
                    <option value="Thiếu">Thiếu</option>
                  </select>

                </td>
                <td>
                  <textarea
                    value={item.note}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    rows={2}
                    placeholder="Nhập ghi chú..."
                    className="warehouse-textarea"
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  Không có nguyên liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content create-staff-form">
            <h3>Phiếu nhập hàng</h3>
            <table className="import-form-table">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Đơn vị</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td><input type="text" name={`name-${index}`} placeholder="Nhập tên..." /></td>
                    <td><input type="text" name={`unit-${index}`} placeholder="kg, trái..." /></td>
                    <td><input type="number" name={`quantity-${index}`} placeholder="0" /></td>
                    <td><input type="number" name={`price-${index}`} placeholder="0" /></td>
                    <td><input type="text" name={`total-${index}`} placeholder="Tự động tính" disabled /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="save-btn" onClick={handleSave}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
