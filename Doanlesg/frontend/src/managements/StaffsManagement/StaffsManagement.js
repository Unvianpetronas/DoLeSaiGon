import React, { useState, useEffect, useRef } from 'react';
import './StaffsManagement.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

const StaffsManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allStatus] = useState(['Hoạt động', 'Nghỉ phép']);
  const [selectedStatus, setSelectedStatus] = useState(['Hoạt động', 'Nghỉ phép']);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: '', code: '', phone: '', department: '', accountId: '',
    avatar: '', adminLevel: ''
  });

  const filterRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/ver0.0.1/staff/accounts/staff', { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          // ✅ FIX: Process the nested JSON structure from the backend
          console.log('API Response Data:', data);
          const staffAccounts = data.map(dto => ({
            // Data from the nested 'account' object
            id: dto.account.id,
            accountId: dto.account.email,
            status: dto.account.status ? 'Hoạt động' : 'Nghỉ phép',

            // Data from the nested 'staff' object
            name: dto.staff.fullName,
            code: dto.staff.employeeId,
            phone: dto.staff.phoneNumber,
            department: dto.staff.department,
            avatar: dto.staff.avatar || '',
          }));

          setEmployees(staffAccounts);
        })
        .catch(err => {
          console.error('Lỗi khi tải danh sách:', err);
          addNotification('Không thể tải danh sách nhân viên.', 'error');
        });
  }, [addNotification]);

  useEffect(() => {
    const result = employees.filter(e =>
        selectedStatus.includes(e.status) &&
        (e.name?.toLowerCase().includes(searchKeyword.toLowerCase()) || e.code?.includes(searchKeyword))
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    fetch(`http://localhost:8080/api/ver0.0.1/admin/accounts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
        .then(res => {
          if (res.ok) {
            setEmployees(prev => prev.filter(e => e.id !== id));
            addNotification('Xóa nhân viên thành công.', 'success');
          } else {
            addNotification('Xóa thất bại.', 'error');
          }
        })
        .catch(err => {
          console.error('Lỗi xoá:', err)
          addNotification('Lỗi kết nối khi xóa.', 'error');
        });
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
  const handleInvert = () => setSelectedStatus(allStatus.filter(s => !selectedStatus.includes(s)));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewStaff(prev => ({ ...prev, avatar: imageUrl, newImageFile: file }));
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

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      email: newStaff.accountId,
      password: 'defaultPassword123',
      fullName: newStaff.name,
      phoneNumber: newStaff.phone,
      employeeId: newStaff.code,
      department: newStaff.department,
    };
    const isEditing = editingId !== null;
    const url = isEditing
        ? `http://localhost:8080/api/ver0.0.1/staff/accounts/staff/${editingId}`
        : `http://localhost:8080/api/ver0.0.1/staff/accounts/new-staff`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        // The backend response is the full Account object, which is nested
        const savedAccount = await response.json();

        // We map the nested response to our flat frontend state structure
        const employeeEntry = {
          id: savedAccount.id,
          accountId: savedAccount.email,
          name: savedAccount.staff.fullName,
          code: savedAccount.staff.employeeId,
          phone: savedAccount.staff.phoneNumber,
          department: savedAccount.staff.department,
          status: savedAccount.status ? 'Hoạt động' : 'Nghỉ phép',
          avatar: savedAccount.staff.avatar || '',
        };

        if (isEditing) {
          setEmployees(prev => prev.map(e => e.id === editingId ? employeeEntry : e));
          addNotification('Cập nhật nhân viên thành công!', 'success');
        } else {
          setEmployees(prev => [employeeEntry, ...prev]);
          addNotification('Tạo nhân viên thành công!', 'success');
        }
        setShowModal(false);
      } else {
        const errorText = await response.text();
        addNotification(`Lỗi: ${errorText}`, 'error');
      }
    } catch (err) {
      addNotification('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  // ... (rest of the component and JSX is the same)
  // The JSX already uses the flattened 'employees' state, so it doesn't need changes.

  return (
      <div className="staffs-management">
        {/* ... JSX for controls ... */}
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
          <button className="btn yellow" /*onClick={handleExportCSV}*/>EXPORT</button>
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
              <th>Email</th>
              <th>Tính năng</th>
            </tr>
            </thead>
            <tbody>
            {filteredEmployees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <select value={e.status} onChange={(evt) => handleStatusChange(e.id, evt.target.value)} className="staff-dropdown" >
                      {allStatus.map((s, i) => ( <option key={i} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td>{e.code}</td>
                  <td>{e.name}</td>
                  <td>{e.phone}</td>
                  <td>{e.department}</td>
                  <td>
                    {e.avatar ? ( <img src={e.avatar} alt="avatar" className="avatar-preview" /> ) : ( <span className="no-image">🚫</span> )}
                  </td>
                  <td>{e.accountId}</td>
                  <td>
                    <FaEdit className="icon edit" onClick={() => handleEdit(e)} />
                    <FaTrashAlt className="icon delete" onClick={() => handleDelete(e.id)} />
                  </td>
                </tr>
            ))}
            {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    Không tìm thấy nhân viên.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {showModal && (
            <div className="modal-backdrop">
              <div className="modal-content create-staff-form">
                <h3>{editingId !== null ? 'Chỉnh sửa nhân viên' : 'Tạo Nhân Viên'}</h3>
                <div className="form-grid">
                  <div className="form-group"> <label>Họ và tên</label> <input type="text" name="name" value={newStaff.name} onChange={handleInputChange} /> </div>
                  <div className="form-group"> <label>Mã nhân viên</label> <input type="text" name="code" value={newStaff.code} onChange={handleInputChange} /> </div>
                  <div className="form-group"> <label>Email</label> <input type="text" name="accountId" value={newStaff.accountId} onChange={handleInputChange} /> </div>
                  <div className="form-group"> <label>Số điện thoại</label> <input type="text" name="phone" value={newStaff.phone} onChange={handleInputChange} /> </div>
                  <div className="form-group"> <label>Phòng ban</label> <input type="text" name="department" value={newStaff.department} onChange={handleInputChange} /> </div>
                  <div className="form-group">
                    <label>Ảnh thẻ</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <div className="avatar-preview">
                      {newStaff.avatar ? ( <img src={newStaff.avatar} alt="preview" /> ) : ( <span className="no-image">🚫</span> )}
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                  <button className="save-btn" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default StaffsManagement;