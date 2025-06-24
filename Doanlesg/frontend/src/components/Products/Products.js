import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { CategoryData } from '../../data/CategoryData';
import './Products.css';
// ... các import giữ nguyên
const ProductsPage = () => {
  const { categorySlug } = useParams();

const currentCategory = CategoryData.find(cat => cat.slug === categorySlug);

  const [products, setProducts] = useState(
    CategoryData.flatMap(cat =>
      cat.products.map(p => ({
        ...p,
        category: cat.slug,
        isFavorite: false,
      }))
    )
  );

  const filtered = categorySlug
    ? products.filter(p => p.category === categorySlug)
    : products;

  const toggleFavorite = (id) => {
    setProducts(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const addToCart = (item) => {
    alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
  };

return (
  <div className="products-wrapper">
    {!categorySlug && (
      <>
        <div className="products-banner">
          <h2 className="brand-name">DoleSaigon</h2>
          <p className="products-description">
            <strong>🌸 Gửi trọn tình thân, trao chọn nghĩa lễ 🌸</strong><br />
            Tại DoleSaigon, mỗi món quà không chỉ là sản phẩm, mà là lời chúc lành – sự gắn kết thiêng liêng giữa các thế hệ.<br />
            Chúng tôi mang đến những <em>mâm lễ tươm tất</em>, <em>quà biếu tinh tế</em> – kết hợp hài hòa giữa giá trị truyền thống và chuẩn mực hiện đại.<br />
            Hơn cả một thương hiệu, DoleSaigon là người bạn đồng hành trong mọi khoảnh khắc sum vầy.
          </p>
        </div>
        <h2 className="products-title">Tất cả sản phẩm</h2>
      </>
    )}

    {categorySlug && currentCategory && (
      <h2 className="products-title">{currentCategory.name}</h2>
    )}

      {/* Danh sách liên kết danh mục */}
      <div className="category-links">
        {CategoryData.map(cat => (
          <Link key={cat.slug} to={`/category/${cat.slug}`} className={`category-link ${cat.slug === categorySlug ? 'active' : ''}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {filtered.length === 0 ? (
        <p className="no-products">Không có sản phẩm nào.</p>
      ) : (
        <div className="products-grid">
          {filtered.map(item => (
            <div key={item.id} className="product-card">
              <Link to={`/product/${item.id}`} className="product-link">
                {item.discount && <div className="discount-badge">{item.discount}</div>}
                <img src={item.image} alt={item.name} className="product-image" />
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price.toLocaleString()} đ</p>
              </Link>
              <div className="product-actions">
                <button className="heart-btn" onClick={() => toggleFavorite(item.id)} title="Yêu thích">
                  <FaHeart className={`heart-icon ${item.isFavorite ? 'red' : ''}`} />
                </button>
                <button className="add-btn" onClick={() => addToCart(item)}>Thêm vào giỏ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
