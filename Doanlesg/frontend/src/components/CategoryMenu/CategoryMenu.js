import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowDropright } from 'react-icons/io';
import { CategoryData } from '../../data/CategoryData';
import './CategoryMenu.css';

const CategoryMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
const navigate = useNavigate();
  return (
    <div
      className="category-menu-wrapper"
      onMouseLeave={() => {
        setShowMenu(false);
        setHoveredCategory(null);
        setHoveredSubcategory(null);
      }}
    >
      <div className="category-main" onMouseEnter={() => setShowMenu(true)}>
      <div
                className="menu-title"
                onClick={() => navigate('/products')} // ✅ điều hướng khi click
                style={{ cursor: 'pointer' }} // ✅ đổi con trỏ thành tay
              >

          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="3" y="3" width="7" height="7" rx="1" ry="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" ry="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" ry="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" ry="1" />
          </svg>
          <span>DANH MỤC SẢN PHẨM ▾</span>
        </div>

        {showMenu && (
          <div className="category-container">
            {/* Danh mục chính */}
            <div className="category-list">
              {CategoryData.map((cat) => (
                <Link
                  to={`/category/${cat.slug}`}
                  key={cat.slug}
                  className="category-item"
                  onMouseEnter={() => {
                    setHoveredCategory(cat);
                    setHoveredSubcategory(null);
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.subcategories && <IoMdArrowDropright className="arrow" />}
                </Link>
              ))}
            </div>

            {/* Subcategories cấp 2 */}
            {hoveredCategory?.subcategories && (
              <div className="subcategory-menu">
                {hoveredCategory.subcategories.map((sub, index) => (
                  <div
                    key={index}
                    className="subcategory-group"
                    onMouseEnter={() => setHoveredSubcategory(sub)}
                  >
                    <div className="subcategory-title">✧ {sub.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Subcategory items cấp 3 */}
            {hoveredSubcategory?.items && (
              <div className="subcategory-items-menu">
                {hoveredSubcategory.items.map((item, idx) => (
                  <div key={idx} className="subcategory-item">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu;
