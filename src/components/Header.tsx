import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './Header.scss';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [unviewedCount, setUnviewedCount] = useState<number>(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const auth = getAuth();

    useEffect(() => {
        const countUnviewedNotifications = async () => {
            try {
                const q = query(collection(db, 'notif'), where('isViewed', '==', false));
                const querySnapshot = await getDocs(q);
                const count = querySnapshot.size;
                setUnviewedCount(count);
            } catch (error) {
                console.error('Error counting unviewed notifications:', error);
            }
        };

        countUnviewedNotifications();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || '');
            } else {
                setUserName(null);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async () => {
        navigate('/notifup');

        try {
            const notificationsRef = collection(db, 'notif');
            const q = query(notificationsRef, where('isViewed', '==', false));
            const querySnapshot = await getDocs(q);

            for (const documentSnapshot of querySnapshot.docs) {
                const docRef = doc(db, 'notif', documentSnapshot.id);
                await updateDoc(docRef, { isViewed: true });
            }

            setUnviewedCount(0);
        } catch (error) {
            console.error('Error updating notifications:', error);
        }
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('role')
            localStorage.removeItem('restaurantUserId')
            localStorage.clear();
            await signOut(auth);
            navigate('/mylogin');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    const handleshowUser = () => {
        if (localStorage.getItem('role') !== 'admin') {
            return (
                <div className="profile-dropdown" ref={dropdownRef}>
                    <div className="profile-link" onClick={profileVisit}>
                        <FaUserCircle className="header-icon admin-icon" />
                    </div>
                </div>
            );
        }
        return null; // Ne retourne rien si le rôle n'est pas admin
    }

    const toggleSearchBar = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };
    const profileVisit = () => {
        navigate("/profile");
      };


    return (
        <header className="header">
            <div className="header-left">
                {isSearchOpen ? (
                    <div className="search-bar">
                        <input type="text" placeholder="Recherchez ici..." />
                        <FaSearch className="search-icon" onClick={toggleSearchBar} />
                    </div>
                ) : (
                    <FaSearch className="search-icon only" onClick={toggleSearchBar} />
                )}
            </div>
            <div className="header-right">
                <div className="notification-wrapper">
                    <FaBell
                        className="header-icon notification"
                        onClick={handleNotificationClick}
                    />
                    {unviewedCount > 0 && (
                        <div className="notif-count">{unviewedCount}</div>
                    )}
                </div>
                {handleshowUser()}
                <div className="logout-wrapper">
                    <FaSignOutAlt className="header-icon logout-icon" onClick={handleLogout} />
                </div>
            </div>
        </header>
    );
};

export default Header;
