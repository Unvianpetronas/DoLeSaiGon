import React, { useState } from 'react';
import './Favorite.css';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Favorite = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: 'Sản phẩm 1',
      image: '/images/to_yen.png',
      price: 250000,
    },
    {
      id: 2,
      name: 'Sản phẩm 2',
      image: '/images/comhoasen.png',
      price: 180000,
    },
    {
          id: 2,
          name: 'Sản phẩm 2',
          image: '/images/comhoasen.png',
          price: 180000,
        },
    {
          id: 2,
          name: 'Sản phẩm 2',
          image: '/images/comhoasen.png',
          price: 180000,
        },

    {
      id: 3,
      name: 'Sản phẩm 3',
      image: '/images/xoingusac.png',
      price: 350000,
    },
    {
      id: 4,
      name: 'Sản phẩm 4',
      image: '/images/to_yen.png',
      price: 410000,
    },
  ]);

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    // Đây chỉ là giả lập thêm vào giỏ, bạn có thể thay bằng Redux hoặc localStorage
    alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
  };

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>Danh sách yêu thích</h2>
      </div>

      {favorites.length === 0 ? (
        <p>Chưa có sản phẩm nào trong danh sách yêu thích.</p>
      ) : (
        <div className="favorite-grid">
          {favorites.map(item => (
            <div className="favorite-card" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="favorite-info">
                <h3>{item.name}</h3>
                <p className="price">{item.price.toLocaleString()} đ</p>

                <div className="favorite-actions">
                  <button
                    className="heart-btn"
                    onClick={() => removeFromFavorites(item.id)}
                    title="Xóa khỏi yêu thích"
                  >
                    <FaHeart className="heart-icon red" />
                  </button>

                  <button
                    className="add-btn"
                    onClick={() => addToCart(item)}
                  >
                    Thêm vào giỏ
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

export default Favorite;
