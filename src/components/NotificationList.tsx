import React, { useEffect, useState } from 'react';
import { Container, Typography, IconButton } from '@mui/material';
import { io, Socket } from 'socket.io-client';
//import axios from 'axios';
import './SStyle.css';
import { collection, getDocs, deleteDoc, doc ,  orderBy, limit, query, where} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Notification {
  id: string;
  clientName: string;
  productName: string;
  isViewed: boolean;
  timestamp: string;
  type: string;
  productId: string;
  commandId: string;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  //const [productMap, setProductMap] = useState<Map<string, string>>(new Map()); 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifCollection = collection(db, 'notif');
        let notificationQuery;
        if (localStorage.getItem('role') === 'restaurant') {
          const resId = localStorage.getItem('restaurantUserId')
          console.log("cmd of rest", resId)
          notificationQuery = query(
            notifCollection,
            where('resId', '==', resId),
            //orderBy('date', 'desc') // Trier par date descendante
          );
        }
        else{
          notificationQuery = query(
            notifCollection,
            where('type', '==', "command"),
          )
        }
        /*{const notificationQuery = query(
          collection(db, 'notif'),
          where('type','==','commande'),
          orderBy('timestamp', 'desc'),
          limit(20)
        );}*/
        const notificationSnapshot = await getDocs(notificationQuery);
        const notificationList: Notification[] = notificationSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        setNotifications(notificationList);
      } catch (error) {
        setError('Échec de la récupération des notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);


  // Set up socket connection for real-time notifications
  useEffect(() => {
    const socket: Socket = io('http://localhost:3008');

    socket.on('reviewNotification', (data: Notification) => {
      console.log('Nouvelle notification reçue:', data);
      setNotifications(prevNotifications => {
        const newNotifications = [data, ...prevNotifications];
        console.log(newNotifications);// Update count in the parent component
        return newNotifications;
      });
    });

    return () => {
      socket.off('reviewNotification');
      socket.disconnect();
    };
  }, );

 
  // Pagination logic
  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);

  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Container key={notifications.length}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <div className="table-container">
        <table className='order-table'>
          <tbody>
            {currentNotifications.map((notification, index) => {
              if (notification.type === 'review') {
                return (
                  <tr key={index} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
                    <td>
                      <strong>{notification.clientName}</strong> a laissé un <a style={{color: "#e88b53" , cursor: "pointer" }}  href={`/ReviewsList/${notification.productId}`}> avis </a> pour le produit <strong>{notification.productName}</strong>
                    </td>
                  </tr>
                );
              } else if (notification.type === 'command') {
                return (
                  <tr key={index} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
                    <td>
                      <strong>{notification.clientName}</strong> a passé une<a style={{color: "#e88b53" , cursor: "pointer" }}  href={`/orders/${notification.commandId}`}> commande</a>
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div> 
      <div className="pagination-container">
        <IconButton
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </IconButton>
        {[1, 2, 3].map(page => (
          <IconButton
            key={page}
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </IconButton>
        ))}
        <IconButton
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={indexOfLastNotification >= notifications.length}
        >
          &gt;
        </IconButton>
      </div>
    </Container>
  );
};

export default NotificationList;


