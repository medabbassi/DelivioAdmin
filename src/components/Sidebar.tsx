import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';
import logo from '../assets/images/Deliviofull.png';
import { FaTachometerAlt, FaShoppingCart, FaUserFriends, FaCogs, FaUtensils } from 'react-icons/fa';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <img src={logo} alt="Logo" className="logo" />
                <button className="collapse-button" onClick={toggleSidebar}>
                    {isCollapsed ? '>' : '<'}
                </button>
            </div>
            <div className="sidebar-menu">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaTachometerAlt className="icon" />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <div className="menu-item" onClick={() => toggleMenu('orders')}>
                            <FaShoppingCart className="icon" />
                            <span>Orders</span>
                        </div>
                        {openMenu === 'orders' && (
                            <ul className="submenu show">
                                <li>
                                    <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Orders List
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/orders/:orderId" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Order Details
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <div className="menu-item" onClick={() => toggleMenu('delivery-men')}>
                            <FaUserFriends className="icon" />
                            <span>Delivery Men</span>
                        </div>
                        {openMenu === 'delivery-men' && (
                            <ul className="submenu show">
                                <li>
                                    <NavLink to="/delivery-men" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Delivery Men List
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/delivery-men/new" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        New Delivery Man
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/delivery-men/edit/:deliveryManId" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Update Delivery Man
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <div className="menu-item" onClick={() => toggleMenu('food')}>
                            <FaUtensils className="icon" />
                            <span>Food Management</span>
                        </div>
                        {openMenu === 'food' && (
                            <ul className="submenu show">
                                <li>
                                    <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Category List
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/categories/new" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Add Category
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/subcategories/new" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Add SubCategory
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Product List
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/products/new" className={({ isActive }) => (isActive ? 'active' : '')}>
                                        Add Product
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaCogs className="icon" />
                            <span>Settings</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="sidebar-footer">
                <div className="help">
                    <p>Hi, how can we help?</p>
                    <p>Contact us if you need any assistance, we will respond as soon as possible.</p>
                    <button>Contact</button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
