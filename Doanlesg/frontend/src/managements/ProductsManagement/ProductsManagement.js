import React, { useState, useEffect, useRef } from 'react';
import './ProductsManagement.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import ProductImage from "../../components/common/ProductImage"; // Make sure the path is correct
import { Helmet } from 'react-helmet-async';

// A custom hook to debounce user input, making API calls more efficient
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

export default function ProductsManagement() {
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const filterRef = useRef(null);
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  useEffect(() => {
    if (!isLoading) {
      if (!user || (!hasRole(user, 'ROLE_ADMIN') && !hasRole(user, 'ROLE_STAFF'))) {
        addNotification('Bạn không có quyền truy cập trang này.', 'error');
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate, addNotification]);

  // Centralized data fetching with race condition prevention
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        const url = debouncedSearchKeyword.trim()
            ? `/api/ver0.0.1/product/productname?keyword=${debouncedSearchKeyword}&page=0&size=100&sort=productName`
            : '/api/ver0.0.1/product?page=0&size=100&sort=id';

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();

        if (!isCancelled) {
          // ✅ ADD: Add a 'lastUpdated' timestamp to each product for cache-busting.
          const productsWithCacheKey = (data.content || []).map(p => ({
            ...p,
            lastUpdated: Date.now()
          }));
          setProducts(productsWithCacheKey);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Lỗi khi tải sản phẩm:', err);
          addNotification('Không thể tải danh sách sản phẩm.', 'error');
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchKeyword, addNotification]);

  // This effect now only derives categories when the base product list changes
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category?.categoryName).filter(Boolean))];
    setAllCategories(uniqueCategories);
    // Automatically select all categories when the product list changes
    setSelectedCategories(uniqueCategories);
  }, [products]);

  // This effect filters the displayed products based on the selected categories
  useEffect(() => {
    const result = products.filter(p =>
        selectedCategories.includes(p.category?.categoryName)
    );
    setFilteredProducts(result);
  }, [products, selectedCategories]);

  // Handles closing the filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      const response = await fetch(`/api/ver0.0.1/staff/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        addNotification("Sản phẩm đã được xóa.", "success");
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const errorText = await response.text();
        addNotification(`Lỗi khi xóa: ${errorText}`, "error");
      }
    } catch (error) {
      addNotification("Không thể kết nối đến máy chủ.", "error");
    }
  };

  const handleCreate = () => navigate('/admin/create');
  // ✅ FIX: When editing, pass the current product state to the edit page.
  // This allows the EditProduct component to receive the `lastUpdated` key.
  const handleEdit = (product) => navigate(`/admin/edit/${product.id}`, { state: { product } });

  const handleCategoryChange = (cat) =>
      setSelectedCategories(prev =>
          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );

  const handleSelectAll = () => setSelectedCategories(allCategories);

  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên sản phẩm', 'Danh mục', 'Đơn giá', 'Số lượng', 'Trạng thái'];
    const rows = filteredProducts.map(p => [
      p.id, p.productName, p.category?.categoryName, p.price, p.stockQuantity,
      p.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'
    ]);
    const csvContent = [headers, ...rows]
        .map(row => row.map(value => `"${value || ''}"`).join(','))
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
        <Helmet>
          <title>Danh Sách Sản Phẩm</title>
        </Helmet>
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
                  <td>{p.price.toLocaleString('vi-VN')} đ</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <div className="product-image-container">
                      {/* ✅ PASS: Pass the product-specific timestamp as the cacheKey. */}
                      <ProductImage
                          productId={p.id}
                          alt={p.productName}
                          className="product-image"
                          cacheKey={p.lastUpdated}
                      />
                    </div>
                  </td>
                  <td className={p.stockQuantity > 0 ? 'status in' : 'status out'}>
                    {p.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </td>
                  <td>
                    <FaEdit className="icon edit" onClick={() => handleEdit(p)} />
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
