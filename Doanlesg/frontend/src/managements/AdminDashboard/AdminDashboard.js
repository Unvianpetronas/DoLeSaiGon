import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import './AdminDashboard.css';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Helmet } from 'react-helmet-async';

// Helper function remains the same
const hasRole = (user, role) => {
    if (!user || !user.roles) return false;
    if (Array.isArray(user.roles)) return user.roles.includes(role);
    return user.roles === role;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#e74c3c', '#9b59b6'];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const { addNotification } = useNotification();

    const [stats, setStats] = useState(null); // Start with null
    const [loadingStats, setLoadingStats] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Authorization effect remains the same
    useEffect(() => {
        if (!isLoading && (!user || !hasRole(user, 'ROLE_ADMIN'))) {
            addNotification('Bạn không có quyền truy cập trang này.', 'error');
            navigate('/login');
        }
    }, [user, isLoading, navigate, addNotification]);

    // ✅ Simplified data fetching effect
    useEffect(() => {
        if (user && hasRole(user, 'ROLE_ADMIN')) {
            const fetchStats = async () => {
                try {
                    setLoadingStats(true);
                    // Call the new, single endpoint for all stats
                    const response = await fetch('/api/ver0.0.1/staff/dashboard/stats', { credentials: 'include' });
                    if (!response.ok) {
                        throw new Error('Không thể tải dữ liệu thống kê.');
                    }
                    const data = await response.json();
                    setStats(data);
                } catch (err) {
                    addNotification(err.message, 'error');
                } finally {
                    setLoadingStats(false);
                }
            };
            fetchStats().then();
        }
    }, [user, addNotification]);

    // Show loading screen
    if (isLoading || loadingStats) {
        return <div>Đang tải trang...</div>;
    }

    // Render nothing if unauthorized or if stats haven't loaded yet
    if (!user || !hasRole(user, 'ROLE_ADMIN') || !stats) {
        return null;
    }

    const pieData = Object.entries(stats.totalRevenueByCategory).map(([name, value]) => ({
        name, value
    }));

    return (
        <>
            <Helmet>
                <title>Dashboard Quản Trị</title>
            </Helmet>
            <h2>Dashboard Quản Trị</h2>

            {/* Cards */}
            <div className="dashboard-cards">
                <div className="dashboard-card blue"><h3>Sản phẩm</h3><p>{stats.totalProducts}</p></div>
                <div className="dashboard-card green"><h3>Đơn hàng</h3><p>{stats.totalOrders}</p></div>
                <div className="dashboard-card yellow"><h3>Khách hàng</h3><p>{stats.totalCustomers}</p></div>
                <div className="dashboard-card red"><h3>Doanh thu năm</h3><p>{stats.totalRevenue.toLocaleString('vi-VN')}₫</p></div>
                <div className="dashboard-card purple">
                    <h3>
                        Doanh thu tháng&nbsp;
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="month-dropdown"
                        >
                            {stats.chartData.map(data => (
                                <option key={data.month} value={data.month}>
                                    {`Tháng ${data.month.split('-')[1]}-${data.month.split('-')[0]}`}
                                </option>
                            ))}
                        </select>
                    </h3>
                    <p>{(stats.monthlyRevenueMap[selectedMonth] || 0).toLocaleString('vi-VN')}₫</p>
                </div>
            </div>

            {/* Charts */}
            <div className="dashboard-charts">
                <div className="dashboard-card chart-card">
                    <h3>Thống kê theo tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#ff7300" tickFormatter={val => `${(val / 1e6).toFixed(1)}tr`} />
                            <Tooltip formatter={(value, name) => name === 'Doanh thu' ? `${value.toLocaleString('vi-VN')}₫` : value} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" name="Đơn hàng" />
                            <Line yAxisId="left" type="monotone" dataKey="customers" stroke="#82ca9d" name="Khách hàng mới" />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" name="Doanh thu" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* ✅ FIX: Updated Pie Chart Layout */}
                <div className="dashboard-card chart-card">
                    <h3>Doanh thu theo danh mục</h3>
                    <div className="pie-chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}₫`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <ul className="pie-legend">
                            {pieData.map((entry, index) => (
                                <li key={`item-${index}`} style={{ color: COLORS[index % COLORS.length] }}>
                                    <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
