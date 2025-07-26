import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Like.css';
import { getFavorites, toggleFavoriteItem } from '../LikeButton/LikeButton';
import AddToCartButton from "../AddToCart/AddToCartButton";
import { Helmet } from 'react-helmet-async';

  const FavoriteProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
      setProducts(getFavorites());
    }, []);

    const handleToggle = (item) => {
      toggleFavoriteItem(item);
      setProducts(getFavorites()); // Refresh sau khi xoá
    };

  const addToCart = (item) => {
      alert(`Đã thêm "${item.productName}" vào giỏ hàng!`);
    };

  return (
    <div className="products-wrapper">
      <Helmet>
        <title>Yêu thích</title>
      </Helmet>
          <h2 className="products-title">Sản phẩm yêu thích</h2>

          {products.length === 0 ? (
            <p className="no-products">Không có sản phẩm trong danh sách yêu thích.</p>
          ) : (
            <div className="product-grid">
              {products.map(item => (
                <div key={item.id} className="promo-item-products">
                  <Link to={`/product/${item.id}`}>
                    <img src={`/products/${item.id}.png`} alt={item.productName} />
                    <span className="discount-tag">-{Math.round(10)}%</span>
                  </Link>

                  <div className="price-box-products">
                  <Link to={`/product/${item.id}`}>
                    <h4>{item.productName}</h4>
                    <span className="old-price-products">{(item.price * 1.1).toLocaleString()}đ</span>
                    <span className="new-price-products">{item.price.toLocaleString()}đ</span>
                    </Link>
                    <div className="action-buttons-homepage">
                      <AddToCartButton product={item} quantity={1} />
                      <button
                        className="heart-btn"
                        onClick={() => handleToggle(item)}
                        title="Bỏ khỏi yêu thích"
                      >
                        <FaHeart className="heart-icon red" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  );
};

export default FavoriteProducts;
