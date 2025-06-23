import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Products.css';

const categories = [
  'Tổ yến', 'Yến chưng tươi', 'Yến nước', 'Đông trùng hạ thảo',
  'Sâm Hàn Quốc', 'Saffron', 'Soup', 'Quà biếu cao cấp',
];

const ProductsPage = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Yến sào tinh chế',
      image: '/images/to_yen.png',
      price: 250000,
      discount: 'Giảm 10%',
      isFavorite: false,
    },
    {
      id: 2,
      name: 'Cơm hoa sen',
      image: '/images/comhoasen.png',
      price: 180000,
      isFavorite: false,
    },
    {
      id: 3,
      name: 'Xôi ngũ sắc',
      image: '/images/xoingusac.png',
      price: 350000,
      isFavorite: false,
    },
    {
      id: 4,
      name: 'Yến sào thượng hạng',
      image: '/images/to_yen.png',
      price: 410000,
      isFavorite: false,
    },
  ]);

  const toggleFavorite = (id) => {
    setProducts(products.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const addToCart = (item) => {
    alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
  };

  return (
    <div className="products-wrapper">
      {/* Banner / Giới thiệu */}
      <div className="products-banner">
        <h2 className="brand-name">DoleSaigon</h2>
        <p className="products-description">
          <strong>🌸 Gửi trọn tình thân, trao chọn nghĩa lễ 🌸</strong><br />
          Tại DoleSaigon, mỗi món quà không chỉ là sản phẩm, mà là lời chúc lành – sự gắn kết thiêng liêng giữa các thế hệ.<br />
          Chúng tôi mang đến những <em>mâm lễ tươm tất</em>, <em>quà biếu tinh tế</em> – kết hợp hài hòa giữa giá trị truyền thống và chuẩn mực hiện đại.<br />
          Hơn cả một thương hiệu, DoleSaigon là người bạn đồng hành trong mọi khoảnh khắc sum vầy.
        </p>
      </div>

      {/* Tiêu đề chính */}
      <h2 className="products-title">Tất cả sản phẩm</h2>

      {/* Danh mục sản phẩm */}
      <div className="category-links">
        {categories.map((cat, index) => (
          <Link
            key={index}
            to={`/category/${cat.replace(/\s+/g, '-').toLowerCase()}`}
            className="category-link"
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <div className="products-grid">
          {products.map(item => (
            <div key={item.id} className="product-card">
              <Link to={`/product/${item.id}`} className="product-link">
                {item.discount && (
                  <div className="discount-badge">{item.discount}</div>
                )}
                <img src={item.image} alt={item.name} className="product-image" />
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price.toLocaleString()} đ</p>
              </Link>

              <div className="product-actions">
                <button
                  className="heart-btn"
                  onClick={() => toggleFavorite(item.id)}
                  title="Yêu thích"
                >
                  <FaHeart className={`heart-icon ${item.isFavorite ? 'red' : ''}`} />
                </button>

                <button className="add-btn" onClick={() => addToCart(item)}>
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
