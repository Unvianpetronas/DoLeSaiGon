import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './EditProducts.css';

export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  // Gọi API lấy sản phẩm theo ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/ver0.0.1/product/productID?id=${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        alert('Không tìm thấy sản phẩm!');
      }
    };
    fetchProduct();
  }, [id]);

  // Gọi API lấy toàn bộ sản phẩm để lọc danh mục duy nhất
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/ver0.0.1/product?page=0&size=100&sort=id');
        const data = await res.json();
        const uniqueCategories = [...new Set(data.content.map(p => p.category?.categoryName || ''))];
        setAllCategories(uniqueCategories);
      } catch (err) {
        console.error('Lỗi khi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  // Tách ảnh nếu là File, còn lại là dữ liệu sản phẩm
  const { image, ...dataToSend } = product;

  const formData = new FormData();

  // Đưa phần dữ liệu sản phẩm dưới dạng JSON (gói trong Blob)
  formData.append(
    "product",
    new Blob([JSON.stringify(dataToSend)], { type: "application/json" })
  );

  // Nếu có ảnh là File (tức người dùng vừa upload), thêm vào form
  if (image instanceof File) {
    formData.append("image", image);
  }

  try {
    const res = await fetch(`http://localhost:8080/staff/products/${id}`, {
      method: "PUT",
      credentials: "include", // gửi cookie session
      body: formData,
    });

    if (res.ok) {
      alert("✅ Cập nhật sản phẩm thành công!");
    } else if (res.status === 403) {
      alert("⛔ Bạn không có quyền cập nhật sản phẩm.");
    } else if (res.status === 404) {
      alert("❌ Không tìm thấy sản phẩm.");
    } else {
      const text = await res.text();
      alert("❌ Lỗi cập nhật sản phẩm: " + text);
    }
  } catch (err) {
    console.error("❌ Lỗi khi gửi cập nhật:", err);
    alert("⚠️ Không thể kết nối đến máy chủ.");
  }
};

  if (!product) return <div>Đang tải sản phẩm...</div>;

  return (
    <div className="create-product-page">
      <h2>Chỉnh Sửa Sản Phẩm</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input name="productName" value={product.productName || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input name="stockQuantity" value={product.stockQuantity || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Danh mục</label>
            <input
              type="text"
              value={product.category?.categoryName || 'Không xác định'}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Đơn giá</label>
            <input name="price" value={product.price || ''} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label>Mô tả chi tiết</label>
            <textarea
              name="detailDescription"
              value={product.detailDescription || ''}
              onChange={handleChange}
              rows="6"
            />
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>Mã sản phẩm</label>
            <input name="id" value={product.id || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Tình trạng</label>
            <input
              type="text"
              value={product.stockQuantity === 0 ? 'Hết hàng' : 'Còn hàng'}
              readOnly
              style={{ color: product.stockQuantity === 0 ? 'red' : 'green', fontWeight: 'bold' }}
            />
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
            <textarea
              name="shortDescription"
              value={product.shortDescription || ''}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <button className="save-btn" type="submit">CẬP NHẬT</button>
        </div>
      </form>
    </div>
  );
}
