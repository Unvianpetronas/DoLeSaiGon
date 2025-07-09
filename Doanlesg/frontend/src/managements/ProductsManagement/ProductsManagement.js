import React, { useState, useEffect, useRef } from 'react';
import './ProductsManagement.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';

// ✅ Dữ liệu mẫu (chưa kết nối API)
const initialProductData = [
  {
    id: 1,
    code: '389033',
    name: 'Mâm Cúng Tết Đoan Ngọ',
    category: 'Mâm lễ',
    price: '1.392.000',
    quantity: 50,
    status: 'Còn hàng',
    image: '/images/BoQuaBonMua.png' // ✅ đường dẫn ảnh
  },
  {
    id: 7,
    code: '389033',
    name: 'Mâm Cúng Tết Đoan Ngọ',
    category: 'Tháp lễ trái cây',
    price: '1.392.000',
    quantity: 50,
    status: 'Còn hàng',
    image: '/images/AnNhienPhuQuy.png'
  },
  {
    id: 2,
    code: '389034',
    name: 'Mâm Cúng Trung Thu',
    category: 'Mâm lễ',
    price: '1.500.000',
    quantity: 0,
    status: 'Hết hàng',
    image: '/images/Xoingusac.png'
  },
  {
    id: 3,
    code: '389035',
    name: 'Mâm Cúng Giao Thừa',
    category: 'Tháp trái cây',
    price: '1.800.000',
    quantity: 30,
    status: 'Còn hàng',
    image: '/images/ChieuTaiDonLoc.png'
  }
];

const ProductsManagement = () => {
  const [products, setProducts] = useState(initialProductData);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const navigate = useNavigate();
  const filterRef = useRef(null);

  // ✅ Cập nhật danh mục và giữ lại những danh mục đang còn
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    setAllCategories(uniqueCategories);
    setSelectedCategories(prev =>
      prev.length === 0 ? uniqueCategories : prev.filter(c => uniqueCategories.includes(c))
    );
  }, [products]);

  // ✅ Lọc sản phẩm theo danh mục & tên
  useEffect(() => {
    const result = products.filter(
      (p) =>
        selectedCategories.includes(p.category) &&
        p.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredProducts(result);
  }, [products, selectedCategories, searchKeyword]);

  // ✅ Tự đóng popup filter nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Xử lý xóa sản phẩm
  const handleDelete = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
  };

  // ✅ Chuyển sang trang tạo sản phẩm
  const handleCreate = () => {
    navigate('/admin/create');
  };

  // ✅ Chuyển sang trang chỉnh sửa sản phẩm
  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`);
  };

  // ✅ Thay đổi danh mục được chọn
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // ✅ Chọn tất cả danh mục
  const handleSelectAll = () => {
    setSelectedCategories(allCategories);
  };

  // ✅ Đảo ngược lựa chọn
  const handleInvert = () => {
    const inverted = allCategories.filter(c => !selectedCategories.includes(c));
    setSelectedCategories(inverted);
  };

  // ✅ Export CSV và tải về máy
  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên sản phẩm', 'Danh mục', 'Đơn giá', 'Số lượng', 'Trạng thái'];
    const rows = filteredProducts.map(p => [
      p.code, p.name, p.category, p.price, p.quantity, p.status
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

      {/* ✅ Thanh công cụ */}
      <div className="admin-controls">
        <button className="btn green" onClick={handleCreate}>CREATE</button>

        {/* ✅ Bộ lọc danh mục */}
        <div className="filter-container" ref={filterRef}>
          <button className="btn pink" onClick={() => setShowFilter(prev => !prev)}>FILTER</button>
          <div className={`filter-popup ${showFilter ? 'show' : ''}`}>
            <div className="filter-commands">
              <span className="link" onClick={handleSelectAll}>Select All</span>
              <span className="link" onClick={handleInvert}>Invert</span>
            </div>
            <div className="filter-options">
              {allCategories.map((cat, idx) => (
                <label key={idx} className="filter-option-item">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
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

        {/* ✅ Tìm kiếm theo tên */}
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

      {/* ✅ Bảng hiển thị danh sách sản phẩm */}
      <div className="table-wrapper">
        <table className="admin-product-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
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
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td><input type="checkbox" /></td>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
                <td>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-image" />
                  ) : (
                    <span className="no-image">🚫</span>
                  )}
                </td>
                <td className={product.status === 'Hết hàng' ? 'status out' : 'status in'}>
                  {product.status}
                </td>
                <td>
                  <FaEdit
                    className="icon edit"
                    title="Chỉnh sửa"
                    onClick={() => handleEdit(product.id)}
                  />
                  <FaTrashAlt
                    className="icon delete"
                    title="Xóa"
                    onClick={() => handleDelete(product.id)}
                  />
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  Không có sản phẩm nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsManagement;
