import React, { useState, useEffect } from 'react';
import './CreateProducts.css';

export default function CreateProduct() {
  const [product, setProduct] = useState({
    name: '',
    code: '',
    quantity: '',
    status: '',
    category: '',
    date: '',
    price: '',
    image: null,
    shortDesc: '',
    detailDesc: ''
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Gọi API lấy toàn bộ sản phẩm rồi lọc danh mục
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/ver0.0.1/product?page=0&size=100&sort=id');
        const data = await res.json();
        const fetchedProducts = data.content || [];
        setProducts(fetchedProducts);

        // Tách danh mục duy nhất từ danh sách sản phẩm
        const uniqueCategories = [
          ...new Map(
            fetchedProducts
              .filter(p => p.category) // lọc sản phẩm có danh mục
              .map(p => [p.category.id, p.category]) // map [id, categoryObject]
          ).values()
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('❌ Lỗi khi lấy sản phẩm để lọc danh mục:', err);
        alert('⚠️ Không thể tải danh mục từ sản phẩm.');
      }
    };
    fetchProducts();
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

  const productData = {
    productName: product.name,
    id: product.code || null,
    stockQuantity: parseInt(product.quantity) || 0,
    status: product.status === 'in',
    price: parseFloat(product.price) || 0,
    shortDescription: product.shortDesc,
    detailDescription: product.detailDesc,
    createdAt: product.date ? product.date + 'T00:00:00' : null,
    category: {
      id: parseInt(product.category)
    }
  };

  const formData = new FormData();
  formData.append(
    'product',
    new File([JSON.stringify(productData)], 'product.json', {
      type: 'application/json'
    })
  );

  if (product.image) {
    formData.append('image', product.image);
  }

  try {
    const response = await fetch('http://localhost:8080/staff/products/new', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (response.ok) {
      alert('✅ Tạo sản phẩm thành công!');
      // Reset
    } else {
      const text = await response.text();
      alert('❌ Tạo thất bại: ' + text);
    }
  } catch (error) {
    alert('⚠️ Không thể kết nối đến máy chủ.');
  }
};

  return (
    <div className="create-product-page">
      <h2>Tạo Mới Sản Phẩm</h2>
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
            <label>Danh mục</label>
            <select name="category" value={product.category} onChange={handleChange}>
              <option value="">--chọn danh mục--</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Đơn giá</label>
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
                <img src={URL.createObjectURL(product.image)} alt="preview" />
              ) : (
                <div className="no-image">📷</div>
              )}
            </div>
          </div>
          <div className="form-group full-width">
            <label>Mô tả ngắn</label>
            <textarea name="shortDesc" value={product.shortDesc} onChange={handleChange} rows="4" />
          </div>
          <button className="save-btn" type="submit">SAVE</button>
        </div>
      </form>
    </div>
  );
}
