import React, { useState, useEffect, useRef } from 'react';
import './StaffsManagement.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';

const initialEmployeeData = [
  { id: 1, status: '', code: '389033', name: 'Nguyễn Văn A', phone: '0928472839', department: 'Admin', avatar: '/images/avatar.png', accountId: '88728291' },
  { id: 2, status: 'Nghỉ phép', code: '389034', name: 'Trần Thị A', phone: '0987654321', department: 'P7', avatar: '/images/avatar.png', accountId: '88728291' },
];

const StaffsManagement = () => {
  const [employees, setEmployees] = useState(initialEmployeeData);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allStatus] = useState(['-', 'Nghỉ phép']);
  const [selectedStatus, setSelectedStatus] = useState(['-', 'Nghỉ phép']);
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newStaff, setNewStaff] = useState({
    name: '',
    code: '',
    phone: '',
    department: '',
    accountId: '',
    avatar: '',
    adminLevel: ''
  });

  const filterRef = useRef(null);

  useEffect(() => {
    const result = employees.filter(
      (e) =>
        selectedStatus.includes(e.status || '-') &&
        (e.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          e.code.includes(searchKeyword))
    );
    setFilteredEmployees(result);
  }, [employees, searchKeyword, selectedStatus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = employees.map(e =>
      e.id === id ? { ...e, status: newStatus } : e
    );
    setEmployees(updated);
  };

  const handleFilterToggle = (status) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSelectAll = () => setSelectedStatus(allStatus);
  const handleInvert = () =>
    setSelectedStatus(allStatus.filter(s => !selectedStatus.includes(s)));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewStaff(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setNewStaff({ name: '', code: '', phone: '', department: '', accountId: '', avatar: '', adminLevel: '' });
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setNewStaff({ ...employee });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingId !== null) {
      const updated = employees.map(e => e.id === editingId ? { ...newStaff, id: editingId } : e);
      setEmployees(updated);
    } else {
      const newId = employees.length + 1;
      const added = { id: newId, status: '', ...newStaff };
      setEmployees([added, ...employees]);
    }
    setShowModal(false);
  };

const handleExportCSV = () => {
  const headers = ['Mã nhân viên', 'Họ và tên', 'Số điện thoại', 'Phòng ban', 'Mã tài khoản', 'Tình trạng'];
  const rows = filteredEmployees.map(e => [
    e.code, e.name, e.phone, e.department, e.accountId, e.status || '-'
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${value}"`).join(','))
    .join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'danh_sach_nhan_vien.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="staffs-management">
      <h2>Danh Sách Nhân Viên</h2>

      <div className="admin-controls">
        <button className="btn green" onClick={handleOpenCreate}>CREATE</button>

        <div className="filter-container" ref={filterRef}>
          <button className="btn pink" onClick={() => setShowFilter(prev => !prev)}>FILTER</button>
          <div className={`filter-popup ${showFilter ? 'show' : ''}`}>
            <div className="filter-commands">
              <span className="link" onClick={handleSelectAll}>Select All</span>
              <span className="link" onClick={handleInvert}>Invert</span>
            </div>
            <div className="filter-options">
              {allStatus.map((status, idx) => (
                <label key={idx} className="filter-option-item">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedStatus.includes(status)}
                    onChange={() => handleFilterToggle(status)}
                  />
                  <span className="filter-label">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button><CiSearch size={20} /></button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Tình trạng</th>
              <th>Mã nhân viên</th>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>Phòng ban</th>
              <th>Ảnh thẻ</th>
              <th>Mã tài khoản</th>
              <th>Tính năng</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((e) => (
              <tr key={e.id}>
                <td>
                  <select
                    value={e.status || '-'}
                    onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                    className="staff-dropdown"
                  >
                    {allStatus.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>{e.code}</td>
                <td>{e.name}</td>
                <td>{e.phone}</td>
                <td>{e.department}</td>
                <td>
                  {e.avatar ? (
                    <img src={e.avatar} alt="avatar" className="avatar-preview" />
                  ) : (
                    <span className="no-image">🚫</span>
                  )}
                </td>
                <td>{e.accountId}</td>
                <td>
                  <FaEdit className="icon edit" onClick={() => handleEdit(e)} />
                  <FaTrashAlt className="icon delete" onClick={() => handleDelete(e.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content create-staff-form">
            <h3>{editingId !== null ? 'Chỉnh sửa nhân viên' : 'Tạo Nhân Viên'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" name="name" value={newStaff.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Mã nhân viên</label>
                <input type="text" name="code" value={newStaff.code} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Mã tài khoản</label>
                <input type="text" name="accountId" value={newStaff.accountId} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" name="phone" value={newStaff.phone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Admin level</label>
                <input type="text" name="adminLevel" value={newStaff.adminLevel} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phòng ban</label>
                <input type="text" name="department" value={newStaff.department} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Ảnh thẻ</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className="avatar-preview">
                  {newStaff.avatar ? (
                    <img src={newStaff.avatar} alt="preview" />
                  ) : (
                    <span className="no-image"></span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="save-btn" onClick={handleSave}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffsManagement;
