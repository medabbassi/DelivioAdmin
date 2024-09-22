import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';
import logo from '../assets/images/Deliviofull.png';
import { FaStoreAlt } from 'react-icons/fa';
import { RiHome2Fill } from 'react-icons/ri';
import { BsBasket3Fill } from 'react-icons/bs';
import { RiEBike2Fill } from 'react-icons/ri';
import { TiGroup } from 'react-icons/ti';
import { PiSealPercentFill } from 'react-icons/pi';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Restaurant {
    acces: boolean;
}

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const role = localStorage.getItem('role');
    const myrole = localStorage.getItem('role');


    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        if (myrole === "sousrestaurant") {
            const fetchRestaurantData = async () => {
                const id = localStorage.getItem("restaurantId");
                if (id) {
                    const docRef = doc(db, 'Reschaine', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as Restaurant;
                        console.log(data);
                        setRestaurant(data);
                        console.log("existe")
                        console.log(data.acces)
                    }
                    
                }
            };

            fetchRestaurantData();
        }
    }, [role]);
    const myacces = restaurant?.acces;
    const isDisabled = myrole !== 'admin' && myrole !== 'restaurant' && !myacces ;
    console.log(myacces, isDisabled)


    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth <= 785);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const logoStyle = {
        maxWidth: isSmallScreen ? '100px' : '200px',
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <img 
                src={logo} 
                alt="Logo" 
                className="logo" 
                style={{ 
                    maxWidth: isSmallScreen ? '200px' : '300px', 
                    marginRight: isSmallScreen ? '-190px' : '0' 
                }} 
            />
            <div className="sidebar-menu">
                <ul>
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <RiHome2Fill className="icon" />
                            <span>Tableau de bord</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/products"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <TbLayoutDashboardFilled className="icon" />
                            <span>Ma Boutique</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/restaurants"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <FaStoreAlt className="icon" />
                            <span>Restaurants</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/orders"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <BsBasket3Fill className="icon" />
                            <span>Commandes</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/delivery-men"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                        >
                            <RiEBike2Fill className="icon" />
                            <span>Livreurs</span>
                        </NavLink>
                    </li>
                    {(role !== 'restaurant' && role !== 'sousrestaurant') && (
                        <li>
                            <NavLink
                                to="/ClientList"
                                className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                            >
                                <TiGroup className="icon" />
                                <span>Clients</span>
                            </NavLink>
                        </li>
                    )}
                    <li className={isDisabled ? 'disabled' : ''}>
                        <NavLink
                            to="/PromoCodeManagement"
                            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
                            onClick={e => isDisabled && e.preventDefault()} // Désactive le clic si le rôle est désactivé
                            style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                        >
                            <PiSealPercentFill className="icon" />
                            <span>Codes Promo</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
