import React, { useState } from 'react';
import './CategoryMenu.css';
import { IoMdArrowDropright } from "react-icons/io";

const categories = [
  {
    name: 'Tổ yến',
    subcategories: [
      {
        name: 'Tổ yến thô',
        items: ['Tổ yến thô loại 1', 'Tổ yến thô loại 2', 'Tổ yến thô loại 3'],
      },
      {
        name: 'Tổ yến cao cấp',
        items: ['Tổ yến cao cấp có đường', 'Tổ yến cao cấp ít đường', 'Tổ yến cao cấp không đường'],
      },
      {
        name: 'Tổ yến làm sạch',
        items: ['Tổ yến làm sạch thường', 'Tổ yến làm sạch cao cấp', 'Tổ yến làm sạch đặc biệt'],
      },
      {
        name: 'Tổ yến rút lông',
        items: ['Chân yến rút lông', 'Hồng yến rút lông', 'Yến huyết rút lông'],
      },
      {
        name: 'Tổ yến tinh chế',
        items: ['Tổ yến tinh chế loại 1', 'Tổ yến tinh chế loại 2', 'Tổ yến tinh chế cao cấp'],
      },
      {
        name: 'Yến vụn',
        items: ['Yến vụn baby', 'Yến vụn tinh chế'],
      },
    ],
  },
  { name: 'Yến chưng tươi' },
  { name: 'Yến nước' },
  { name: 'Đông trùng hạ thảo' },
  { name: 'Sâm Hàn Quốc' },
  { name: 'Saffron' },
  { name: 'Soup' },
  { name: 'Quà biếu cao cấp' },
];

const CategoryMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);

  return (
    <div
      className="category-menu-wrapper"
      onMouseLeave={() => {
        setShowMenu(false);
        setHoveredCategory(null);
        setHoveredSubcategory(null);
      }}
    >
      <div
        className="category-main"
        onMouseEnter={() => setShowMenu(true)}
      >
        <div className="menu-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="3" y="3" width="7" height="7" rx="1" ry="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1" ry="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1" ry="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1" ry="1"/>
                      </svg>
          <span>DANH MỤC SẢN PHẨM ▾</span>
        </div>

        {showMenu && (
          <div className="category-container">
            <div className="category-list">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="category-item"
                  onMouseEnter={() => {
                    setHoveredCategory(cat);
                    setHoveredSubcategory(null);
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.subcategories && <IoMdArrowDropright className="arrow" />}
                </div>
              ))}
            </div>

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

            {hoveredSubcategory && (
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
