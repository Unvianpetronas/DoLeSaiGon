import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import './EditProducts.css'; // Assuming you have this CSS file

// Helper function to safely check for a user's role
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  return user.roles === role;
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotification();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Effect for authorization and fetching initial data
  useEffect(() => {
    if (isAuthLoading) return;

    const isAdmin = hasRole(user, 'ROLE_ADMIN');
    const isStaff = hasRole(user, 'ROLE_STAFF');

    if (!user || (!isAdmin && !isStaff)) {
      addNotification('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both the product details and the list of all categories
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`http://localhost:8080/api/ver0.0.1/staff/products/${id}`, { credentials: 'include' }),
          fetch('http://localhost:8080/api/ver0.0.1/staff/categories', { credentials: 'include' })
        ]);

        if (!productRes.ok) throw new Error('Không tìm thấy sản phẩm.');
        if (!categoriesRes.ok) throw new Error('Không thể tải danh mục.');

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        setProduct(productData);
        setCategories(categoriesData);
        setImagePreview(productData.image); // Set initial image preview

      } catch (err) {
        setError(err.message);
        addNotification(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user, isAuthLoading, navigate, addNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct(prevProduct => {
      // This function receives the most up-to-date state (prevProduct)

      // Handle the special case for the nested category ID
      if (name === 'categoryId') {
        return {
          ...prevProduct, // 1. Copy all existing top-level product properties
          category: {
            ...prevProduct.category, // 2. Copy existing nested category data
            id: parseInt(value, 10) || '', // 3. Only update the category's ID
          },
        };
      }

      // For all other standard inputs (e.g., productName, price)
      return {
        ...prevProduct, // 1. This is the key: copy all existing data
        [name]: value,  // 2. Then, overwrite only the field that changed
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    setIsSubmitting(true);

    // This is the data object that matches your backend Product entity
    const productData = {
      id: product.id,
      productName: product.productName,
      // CORRECTED LINE: Use stockQuantity to match the input field name
      stockQuantity: parseInt(product.stockQuantity, 10),
      price: parseFloat(product.price),
      shortDescription: product.shortDescription,
      detailDescription: product.detailDescription,
      // Make sure the status is a boolean
      status: String(product.status) === 'true',
      category: { id: product.category.id },
    };

    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    // Only append the image if a new one has been selected
    if (newImage) {
      formData.append('image', newImage);
    }

    try {
      // Use the correct endpoint for updating, which might be different from creating
      const response = await fetch(`http://localhost:8080/api/ver0.0.1/staff/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        addNotification('Cập nhật sản phẩm thành công!', 'success');
        navigate('/admin/products');
      } else {
        const msg = await response.text();
        throw new Error(msg || 'Lỗi khi cập nhật sản phẩm.');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không tìm thấy sản phẩm.</div>;

  return (
      <div className="create-product-page">
        <h2>Chỉnh Sửa Sản Phẩm</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-left">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input name="productName" value={product.productName || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input name="stockQuantity" type="number" value={product.stockQuantity || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select name="categoryId" value={product.category?.id || ''} onChange={handleChange} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Đơn giá</label>
              <input name="price" type="number" value={product.price || ''} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label>Mô tả chi tiết</label>
              <textarea name="detailDescription" value={product.detailDescription || ''} onChange={handleChange} rows="6" />
            </div>
          </div>

          <div className="form-right">
            <div className="form-group">
              <label>Mã sản phẩm</label>
              <input name="id" value={product.id || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Tình trạng</label>
              <select name="status" value={product.status} onChange={handleChange} required>
                <option value={true}>Còn hàng</option>
                <option value={false}>Hết hàng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ảnh sản phẩm</label>
              <input type="file" name="image" onChange={handleImageChange} />
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
              <textarea name="shortDescription" value={product.shortDescription || ''} onChange={handleChange} rows="4" />
            </div>
            <button className="save-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
            </button>
          </div>
        </form>
      </div>
  );
}