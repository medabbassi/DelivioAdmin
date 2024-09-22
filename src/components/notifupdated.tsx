import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase Auth
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Import Firestore
import '../notifcss/css/app.min.css';
import '../notifcss/css/icons.min.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useNavigate } from 'react-router-dom';
//import '../assets/cssf/owl.carousel.min.css';
//import '../assets/cssf/owl.theme.default.min.css';
//import '../assets/cssf/nice-select.css';
import './notiupdated.css'
//import '../assets/cssf/style.css';
//import '../assets/cssf/responsive.css';
//import '../assets/cssf/color.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faXmark } from '@fortawesome/free-solid-svg-icons'; // Import icons
import avatar from '../notifcss/images/users/avatar-10.jpg'
import { useHref } from 'react-router-dom';
import { timeLog } from 'console';
import { FaEye } from 'react-icons/fa';
//import "./cantact.css";

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}
interface Notification {
  id: string;
  clientName: string;
  productName: string;
  reviewerName: string;
  productId: string;
  commandId: string;
  isViewed: boolean;
  timestamp: Timestamp;
  resId: string
  type: string;
}
const Notificationup: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const [reelnotifications, setreelNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const [productMap, setProductMap] = useState<Map<string, string>>(new Map()); 
  const [mycurrentTime, setCurrentTime] = useState('');
  const [formattedNotifications, setFormattedNotifications] = useState<Notification[]>([]);
 /* const [groupedNotifications, setGroupedNotifications] = useState<{
    today: Notification[];
    others: Notification[];
  }>({
    today: [],
    others: [],
  });*/
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, Notification[]>>({});



  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notifCollection = collection(db, 'notif');
        let notificationQuery;
        if (localStorage.getItem('role') === 'restaurant' || localStorage.getItem('role') === 'sousrestaurant') {
          const resId = localStorage.getItem('restaurantUserId')
          console.log("cmd of rest", resId)
          notificationQuery = query(
            notifCollection,
            where('type', 'in', ["review" , "command"]),
            where('resId', '==', resId),
            //orderBy('date', 'desc') // Trier par date descendante
          );
          
        }
        else {
         notificationQuery = query(notifCollection, where('type', '==', "command"));
        }
        const notificationSnapshot = await getDocs(notificationQuery);

        const notificationList: Notification[] = notificationSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Notification[];
         // const sortedNotifications = notificationList.sort((a, b) => b.timestamp - a.timestamp);
         const sortedNotifications = notificationList.sort((a, b) => {
            const dateA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
            const dateB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
            return dateB - dateA;
          });
          const newFormattedNotifications = sortedNotifications.map(notif => {
            const notifTimestamp = notif.timestamp;
            const myseconds = notifTimestamp.seconds;
            const nanoseconds = notifTimestamp.nanoseconds;

            // Convert seconds to milliseconds
            const milliseconds = myseconds * 1000;

            // Convert nanoseconds to milliseconds
            const nanosecondsToMilliseconds = nanoseconds / 1000000;

            // Combine milliseconds from seconds and nanoseconds
            const timestampInMillis = milliseconds + nanosecondsToMilliseconds;
            //const timestampInMillis = notifTimestamp * 1000;
            

            // Create a new date
            const notifDate = new Date(timestampInMillis);
            console.log(notifDate)
            const hours = notifDate.getHours();
            const minutes = notifDate.getMinutes();
            const seconds = notifDate.getSeconds();

            // Format the time
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';
            const reviewerInitial = getInitial(notif.clientName);


            return {
              ...notif,
              formattedTime,
              reviewerInitial // Add initials to the notification object
            };
          });
          setFormattedNotifications(newFormattedNotifications);
          console.log(newFormattedNotifications)

        // Group notifications by date
        const grouped: Record<string, Notification[]> = {};
        newFormattedNotifications.forEach(notif => {
          const notifDate = new Date(notif.timestamp.seconds * 1000);
          const dateKey = notifDate.toLocaleDateString('fr-FR');
          console.log(dateKey);


          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }

          grouped[dateKey].push(notif);
        });

        setGroupedNotifications(grouped);


      } catch (error) {
        setError('Failed to fetch notifications');
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Ajoutez les dépendances si nécessaire

  // Helper function to check if a date is today
  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const todayString = today.toLocaleDateString('fr-FR');
    return dateString === todayString;
  };
  


  useEffect(() => {
    // Set up socket connection
    const socket: Socket = io('http://localhost:3008');

    socket.on('reviewNotification', (data: Notification) => {
      console.log('Notification reçue:', data);
        setreelNotifications(prevNotifications => [data, ...prevNotifications]);
        console.log('Notifications en cours:', reelnotifications);
    });

    return () => {
      socket.off('reviewNotification');
      socket.disconnect();
    };
  }, []); // Dependency on userName
  const handleNotificationcmdClick = (commandId: string) => {
    navigate(`/orders/${commandId}`);
  };
  const handleNotificationproClick = (commandId: string) => {
    navigate(`/ReviewsList/${commandId}`);
  };

  return (
    <>
    <div className="page-wrapper">
      <div className="page-content">
      <li className="my-mx-3 my-welcome-text">
        <h3 className="my-mb-0 my-fw-bold my-text-truncate" style={{fontFamily:"Helvetica Neue, Helvetica,"}}>Bonjour</h3>
       </li> 
        <div className="container-xxl">
          <div className="row justify-content-center">
            <div className="col-12">
            {reelnotifications.map((notif, index) => (
              <div  key={notif.id} className="my-own-card" style={{ backgroundColor: "#ffd88e3b" , height: "130px"}}>
                <div className="my-card-body">
                  <div className="row">
                    <div className="col">
                      <h6 className="my-mb-2 my-mt-1 my-fw-medium my-text-dark my-fs-18">{notif.clientName}</h6>
                      <p>
                      {notif.type === 'command' ? (
                            <>
                                <strong>{notif.clientName}</strong> a passé une <strong>commande</strong>
                            </>
                            ) : (
                                <>
                                            <strong>{notif.clientName}</strong> a ajouté un avis pour le produit <strong>{notif.productName}</strong>
                                            </>
                                        )}
                                        </p>
                    </div>

                    <div className="col-md-2 text-end align-self-center">
                      <FontAwesomeIcon icon={faEye} className="btn my-btn-primary btn-sm px-2 my-notif-btn profile-link" onClick={() => handleNotificationcmdClick(notif.productId)}/>
                    </div>
           
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(groupedNotifications).map(date => (
        <div key={date} className="card-body mb-3">
          {/* Check if the date is today's date */}
          <h5 className="my-text-body my-m-0 d-inline-block">
            {isToday(date) ? "Aujourd'hui" : date}
          </h5>
          <span className="my-text-pink my-bg-pink-subtle my-py-0 my-px-1 my-rounded my-fw-medium my-d-inline-block my-ms-1">
            {(groupedNotifications)[date].length}
          </span>
          {(groupedNotifications as any)[date].map((notif: { id: React.Key | null | undefined; productId: string; reviewerInitial: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; clientName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; formattedTime: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; commandId: string; type:string; productName: string; }) => (
            <div key={notif.id} className="my-own-card">
              <div className="my-card-body">
                <div className="row">
                  <div className="col-md-10">
                    <a href="#">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="thumb-lg rounded-circle" style={{backgroundColor:"#FFB777"}}>
                            {notif.reviewerInitial}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-2 text-truncate">
                          <h6 className="my-1 fw-medium text-dark fs-14">
                            {notif.clientName}
                            <small className="text-muted ps-2">{notif.formattedTime}</small>
                          </h6>
                          <p className="text-muted mb-0 text-wrap">
                                        {notif.type === 'command' ? (
                                                <>
                                                <strong>{notif.clientName}</strong> a passé une <strong>commande</strong>
                                                </>
                                            ) : (
                                                <>
                                            <strong>{notif.clientName}</strong> a ajouté un avis pour le produit <strong>{notif.productName}</strong>
                                            </>
                                        )}
                                        </p>
                        </div>
                      </div>
                    </a>
                  </div>
                  {notif.type === 'command' ? (
                  <div className="col-md-2 text-end align-self-center">
                    <FontAwesomeIcon icon={faEye} className="btn my-btn-primary btn-sm px-2 my-notif-btn" onClick={() => handleNotificationcmdClick(notif.commandId)} />
                  </div>
                  ) : (
                    <div className="col-md-2 text-end align-self-center">
                    <FontAwesomeIcon icon={faEye} className="btn my-btn-primary btn-sm px-2 my-notif-btn" onClick={() => handleNotificationproClick(notif.productId)} />
                  </div>
                  )
                }
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  );
};
export default Notificationup;
