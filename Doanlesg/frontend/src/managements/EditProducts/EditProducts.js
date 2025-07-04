import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './EditProducts.css';

// ✅ Dữ liệu mẫu giả lập
const fakeProductList = [
  {
    id: 1,
    name: 'Mâm Cúng Tết Đoan Ngọ',
    code: '389033',
    quantity: 50,
    status: 'in',
    category: '1',
    date: '2025-06-01',
    price: '1392000',
    image: '/images/logo.png',
    shortDesc: 'Mô tả ngắn gọn',
    detailDesc: 'Mô tả chi tiết sản phẩm đầy đủ'
  },
  // thêm các sản phẩm khác nếu cần
];

export default function EditProduct() {
  const { id } = useParams(); // ✅ Lấy ID từ URL
  const [product, setProduct] = useState(null);

  // ✅ Khi load trang, lấy dữ liệu sản phẩm theo ID
  useEffect(() => {
    const foundProduct = fakeProductList.find((p) => p.id === Number(id));
    if (foundProduct) {
      setProduct({ ...foundProduct });
    } else {
      alert('Không tìm thấy sản phẩm!');
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Đã cập nhật sản phẩm:', product);
    // Gửi API cập nhật tại đây
  };

  if (!product) return <div>Đang tải sản phẩm...</div>;

  return (
    <div className="create-product-page">
      <h2>Chỉnh Sửa Sản Phẩm</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input name="name" value={product.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input name="quantity" value={product.quantity} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mã danh mục</label>
            <select name="category" value={product.category} onChange={handleChange}>
              <option value="">--chọn danh mục--</option>
              <option value="1">Mâm quả</option>
              <option value="2">Tháp trái cây</option>
            </select>
          </div>
          <div className="form-group">
            <label>Đơn giá gốc</label>
            <input name="price" value={product.price} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label>Mô tả chi tiết</label>
            <textarea name="detailDesc" value={product.detailDesc} onChange={handleChange} rows="6" />
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>Mã sản phẩm</label>
            <input name="code" value={product.code} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Tình trạng</label>
            <select name="status" value={product.status} onChange={handleChange}>
              <option value="">--chọn tình trạng--</option>
              <option value="in">Còn hàng</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ngày tạo</label>
            <input type="date" name="date" value={product.date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Ảnh sản phẩm</label>
            <input type="file" name="image" onChange={handleChange} />
            <div className="image-preview">
              {product.image ? (
                <img
                  src={typeof product.image === 'string' ? product.image : URL.createObjectURL(product.image)}
                  alt="preview"
                />
              ) : (
                <div className="no-image">📷</div>
              )}
            </div>
          </div>
          <div className="form-group full-width">
            <label>Mô tả ngắn</label>
            <textarea name="shortDesc" value={product.shortDesc} onChange={handleChange} rows="4" />
          </div>
          <button className="save-btn" type="submit">CẬP NHẬT</button>
        </div>
      </form>
    </div>
  );
}
