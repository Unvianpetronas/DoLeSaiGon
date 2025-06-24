import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Like.css';

const FavoriteProducts = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Yến sào tinh chế',
      image: '/images/to_yen.png',
      price: 250000,
      discount: 'Giảm 10%',
      isFavorite: true,
    },
    {
      id: 2,
      name: 'Cơm hoa sen',
      image: '/images/comhoasen.png',
      price: 180000,
      isFavorite: true,
    },
    {
      id: 3,
      name: 'Xôi ngũ sắc',
      image: '/images/xoingusac.png',
      price: 350000,
      isFavorite: true,
    },
    {
      id: 4,
      name: 'Yến sào thượng hạng',
      image: '/images/to_yen.png',
      price: 410000,
      isFavorite: true,
    },
  ]);

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

  const favoriteItems = products.filter(p => p.isFavorite);

  return (
    <div className="products-wrapper">
      <h2 className="products-title">Sản phẩm yêu thích</h2>

      {favoriteItems.length === 0 ? (
        <p className="no-products">Không có sản phẩm trong danh sách yêu thích.</p>
      ) : (
        <div className="products-grid">
          {favoriteItems.map(item => (
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
                  title="Bỏ khỏi yêu thích"
                >
                  <FaHeart className="heart-icon red" />
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

export default FavoriteProducts;
