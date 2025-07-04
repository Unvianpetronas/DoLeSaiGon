import React, { useState, useEffect, useRef } from 'react';
import './ProductsManagement.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();
  const filterRef = useRef(null);

  // 🌐 Gọi API lấy toàn bộ sản phẩm
  const fetchAllProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/ver0.0.1/product?page=0&size=100&sort=id');
      const data = await res.json();
      console.log('📦 Tất cả sản phẩm:', data.content);
      setProducts(data.content || []);
    } catch (err) {
      console.error('❌ Lỗi khi gọi API allProducts:', err);
    }
  };

  // 🔍 Gọi API tìm kiếm sản phẩm theo tên
  const fetchByKeyword = async (keyword) => {
    try {
      const res = await fetch(`http://localhost:8080/api/ver0.0.1/product/productname?keyword=${searchKeyword}&page=0&size=100&sort=productName`)
      const data = await res.json();
      console.log('🔍 Kết quả tìm kiếm:', data.content);
      setProducts(data.content || []);
    } catch (err) {
      console.error('❌ Lỗi khi gọi API tìm kiếm:', err);
    }
  };

  // 🚀 Thay đổi từ khóa → gọi API hoặc load toàn bộ
  useEffect(() => {
    if (searchKeyword.trim()) {
      fetchByKeyword(searchKeyword);
    } else {
      fetchAllProducts();
    }
  }, [searchKeyword]);

  // 🧠 Lấy danh mục sản phẩm từ dữ liệu
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category?.categoryName || ''))];
    console.log('📁 Danh sách danh mục:', uniqueCategories);
    setAllCategories(uniqueCategories);
    setSelectedCategories(prev =>
      prev.length === 0 ? uniqueCategories : prev.filter(c => uniqueCategories.includes(c))
    );
  }, [products]);

  // 🔧 Lọc sản phẩm theo danh mục & từ khóa
  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const result = products.filter(p =>
      selectedCategories.includes(p.category?.categoryName) &&
      p.productName?.toLowerCase().includes(keyword)
    );
    console.log('📑 Sản phẩm hiển thị sau khi lọc:', result);
    setFilteredProducts(result);
  }, [products, selectedCategories, searchKeyword]);

  // ✅ Tự đóng popup filter khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🧹 Hành động
  const handleDelete = (id) => {
    console.log('🗑️ Xóa sản phẩm ID:', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleCreate = () => navigate('/admin/create');
  const handleEdit = (id) => navigate(`/admin/edit/${id}`);

  const handleCategoryChange = (cat) =>
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );

  const handleSelectAll = () => setSelectedCategories(allCategories);

  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên sản phẩm', 'Danh mục', 'Đơn giá', 'Số lượng', 'Trạng thái'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.productName,
      p.category?.categoryName,
      p.price,
      p.stockQuantity,
      p.stockQuantity === 0 ? 'Hết hàng' : 'Còn hàng'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_sach_san_pham.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="products-management">
      <h2>Danh Sách Sản Phẩm</h2>

      <div className="admin-controls">
        <button className="btn green" onClick={handleCreate}>CREATE</button>

        <div className="filter-container" ref={filterRef}>
          <button className="btn pink" onClick={() => setShowFilter(prev => !prev)}>FILTER</button>
          <div className={`filter-popup ${showFilter ? 'show' : ''}`}>
            <div className="filter-commands">
              <span className="link" onClick={handleSelectAll}>Select All</span>
            </div>
            <div className="filter-options">
              {allCategories.map((cat, idx) => (
                <label key={idx} className="filter-option-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="filter-label">{cat}</span>
                </label>
              ))}
              {allCategories.length === 0 && (
                <div className="no-category">Không có danh mục nào.</div>
              )}
            </div>
          </div>
        </div>

        <button className="btn yellow" onClick={handleExportCSV}>EXPORT</button>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
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
              <th>Mã</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Hình ảnh</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.productName}</td>
                <td>{p.category?.categoryName}</td>
                <td>{p.price}</td>
                <td>{p.stockQuantity}</td>
                <td>
                  {p.image
                    ? <img src={p.image} alt={p.productName} className="product-image" />
                    : <span className="no-image">🚫</span>}
                </td>
                <td className={p.stockQuantity === 0 ? 'status out' : 'status in'}>
                  {p.stockQuantity === 0 ? 'Hết hàng' : 'Còn hàng'}
                </td>
                <td>
                  <FaEdit className="icon edit" onClick={() => handleEdit(p.id)} />
                  <FaTrashAlt className="icon delete" onClick={() => handleDelete(p.id)} />
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Không có sản phẩm nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}