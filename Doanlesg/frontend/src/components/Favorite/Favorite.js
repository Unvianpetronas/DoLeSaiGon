import React, { useState } from 'react';
import './Favorite.css';
import { FaHeart } from 'react-icons/fa';

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
        {
          id: 5,
          name: 'Sản phẩm 5',
          image: '/images/to_yen.png',
          price: 410000,
        },
            {
              id: 6,
              name: 'Sản phẩm 6',
              image: '/images/to_yen.png',
              price: 410000,
            },
  ]);

  // Danh sách ID đang chuẩn bị bị xóa để đổi màu trái tim trước
  const [removingIds, setRemovingIds] = useState([]);

  const handleRemove = (id) => {
    // Đánh dấu ID đang xóa để đổi màu trái tim
    setRemovingIds(prev => [...prev, id]);

    // Sau 300ms thì xóa khỏi danh sách
    setTimeout(() => {
      setFavorites(prev => prev.filter(item => item.id !== id));
      setRemovingIds(prev => prev.filter(rid => rid !== id));
    }, 300);
  };

  const addToCart = (item) => {
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
                    onClick={() => handleRemove(item.id)}
                    title="Xóa khỏi yêu thích"
                  >
                    <FaHeart className={`heart-icon ${removingIds.includes(item.id) ? 'white' : 'red'}`} />
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
