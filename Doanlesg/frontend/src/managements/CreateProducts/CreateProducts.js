import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateProducts.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateProduct() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotification();

  const [product, setProduct] = useState({
    productName: '',
    stockQuantity: '',
    status: true, // Default to true (Còn hàng)
    categoryId: '',
    price: '',
    image: null,
    shortDescription: '',
    detailDescription: ''
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthLoading) {
      // If auth check is done and user is not an admin, redirect
      if (!user || !user.roles?.includes('ROLE_ADMIN')) {
        addNotification('Bạn không có quyền truy cập trang này.', 'error');
        navigate('/login');
      }
    }
  }, [user, isAuthLoading, navigate, addNotification]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/ver0.0.1/staff/categories');
        if (!res.ok) throw new Error('Could not fetch categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
        addNotification('Không thể tải danh mục sản phẩm.', 'error');
      }
    };
    fetchCategories();
  }, [addNotification]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setProduct((prev) => ({ ...prev, image: file }));
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      productName: product.productName,
      stockQuantity: parseInt(product.stockQuantity, 10) || 0,
      status: product.status === 'true',
      price: parseFloat(product.price) || 0,
      shortDescription: product.shortDescription,
      detailDescription: product.detailDescription,
      category: {
        id: parseInt(product.categoryId, 10)
      }
    };

    const formData = new FormData();
    formData.append(
        'product',
        new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );

    if (product.image) {
      formData.append('image', product.image);
    } else {
      addNotification('Vui lòng chọn ảnh sản phẩm.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/ver0.0.1/staff/products/new', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        addNotification('Tạo sản phẩm thành công!', 'success');
        navigate('/admin/products');
      } else {
        const errorText = await response.text();
        addNotification(`Tạo thất bại: ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      addNotification('Không thể kết nối đến máy chủ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading screen while checking auth
  if (isAuthLoading) {
    return <div>Đang kiểm tra quyền truy cập...</div>;
  }

  return (
      <div className="create-product-page">
        <h2>Tạo Mới Sản Phẩm</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-left">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input name="productName" value={product.productName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select name="categoryId" value={product.categoryId} onChange={handleChange} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Đơn giá</label>
              <input type="number" name="price" value={product.price} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label>Mô tả chi tiết</label>
              <textarea name="detailDescription" value={product.detailDescription} onChange={handleChange} rows="6" />
            </div>
          </div>

          <div className="form-right">
            <div className="form-group">
              <label>Tình trạng</label>
              <select name="status" value={product.status} onChange={handleChange} required>
                <option value="true">Còn hàng</option>
                <option value="false">Hết hàng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ảnh sản phẩm</label>
              <input type="file" name="image" onChange={handleChange} />
              <div className="image-preview">
                {imagePreview ? (
                    <img src={imagePreview} alt="Xem trước" />
                ) : (
                    <div className="no-image">📷</div>
                )}
              </div>
            </div>
            <div className="form-group full-width">
              <label>Mô tả ngắn</label>
              <textarea name="shortDescription" value={product.shortDescription} onChange={handleChange} rows="4" />
            </div>
            <button className="save-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
  );
}
