import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CategoryMenu.css';
import { IoMdArrowDropright } from 'react-icons/io';

const categories = [
  {
    name: 'Mâm hoa quả',
    subcategories: [
      { name: 'Mâm quả' },
      { name: 'Tháp quả' },
      { name: 'Mâm phật thủ' },
    ],
  },
  {
    name: 'Mâm cúng lễ',
    subcategories: [
      { name: 'Mâm thần tài' },
      { name: 'Mâm tất niên' },
      { name: 'Mâm cúng động thổ' },
      { name: 'Mâm cúng khai trương' },
      { name: 'Mâm cúng rằm, mùng 1' },
      { name: 'Mâm cúng thôi nôi, đầy tháng' },
      { name: 'Mâm tết đoan ngọ' },
    ],
  },
  {
    name: 'Hộp quà tặng',
    subcategories: [
      {
        name: 'Bộ quà Bốn Mùa',
        items: ['Mùa xuân', 'Mùa hạ', 'Mùa thu', 'Mùa đông'],
      },
      {
        name: 'Bộ quà tặng cao cấp',
        items: ['Bộ quà thịnh vượng', 'Bộ quà tài lộc', 'Bộ quà hạnh phúc'],
      },
      {
        name: 'Bộ quà sức khỏe',
        items: ['Dinh dưỡng tự nhiên', 'Yến sào', 'Nhân sâm'],
      },
    ],
  },
  {
    name: 'Mâm bánh',
    subcategories: [
      { name: 'Mâm bánh kẹo' },
      { name: 'Mâm bánh bao' },
      { name: 'Mâm bánh xu xê, bánh cốm' },
      { name: 'Tháp oản' },
    ],
  },
  {
    name: 'Mâm chay, mặn',
    subcategories: [
      {
        name: 'Mâm chay',
        items: ['Mâm bánh trôi chay'],
      },
      {
        name: 'Mâm mặn',
        items: ['Heo quay', 'Xôi', 'Xôi-Gà', 'Mâm cúng mặn'],
      },
    ],
  },
];

const getCategorySlug = (name) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
};

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
              {categories.map((cat, index) => {
                const slug = getCategorySlug(cat.name);
                return (
                  <Link
                    to={`/category/${slug}`}
                    key={index}
                    className="category-item"
                    onMouseEnter={() => {
                      setHoveredCategory(cat);
                      setHoveredSubcategory(null);
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.subcategories && <IoMdArrowDropright className="arrow" />}
                  </Link>
                );
              })}
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
