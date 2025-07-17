import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowDropright } from 'react-icons/io';
import { CategoryData, keywordMap } from '../../data/CategoryData';
import './CategoryMenu.css';

const CategoryMenu = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const navigate = useNavigate();

    const handleLeave = () => {
        setShowMenu(false);
        setHoveredCategory(null);
    };

    return (
        <div className="category-menu-wrapper" onMouseLeave={handleLeave}>
            <div className="category-main" onMouseEnter={() => setShowMenu(true)}>
                <div
                    className="menu-title"
                    onClick={() => navigate('/products')}
                    style={{ cursor: 'pointer' }}
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

                        {/* Cấp 1 */}
                        <div className="category-list">
                            {CategoryData.map(cat => (
                                <Link
                                    key={cat.slug}
                                    to={`/category/${cat.slug}`}
                                    className="category-item"
                                    onMouseEnter={() => setHoveredCategory(cat)}
                                >
                                    <span>{cat.name}</span>
                                    {cat.subcategories && <IoMdArrowDropright className="arrow" />}
                                </Link>
                            ))}
                        </div>

                        {/* Cấp 2 */}
                        {hoveredCategory?.subcategories && (
                            <div className="subcategory-menu">
                                {hoveredCategory.subcategories.map(sub => (
                                    <Link
                                        key={sub.name}
                                        to={`/category/${keywordMap[sub.name]}?sub=${encodeURIComponent(sub.name)}`}
                                        className="subcategory-group"
                                    >
                                        <div className="subcategory-title">✧ {sub.name}</div>
                                    </Link>
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
