import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import according to your firebase configuration
import './SStyle.css'; // Import the CSS file

interface OrderItem {
  productName: string;
  quantity: number | null;
  productPrice: string;
  productImage: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: string;
  status?: string;  // Make status optional
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'command');
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersList: Order[] = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items,
            totalPrice: data.finalTotal.toFixed(2),
            status: data.status || 'Pending',
            createdAt: data.createdAt,
            shippingAddress: data.deliveryAddress.address,
            paymentMethod: data.paymentMethod,
          };
        });
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setFilteredOrders(
      orders.filter(order => 
        searchStatus === '' || (order.status && order.status.toLowerCase().includes(searchStatus.toLowerCase()))
      )
    );
  }, [searchStatus, orders]);

  const getStatusColor = (status?: string) => {
    if (!status) return 'black';
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'green';
      case 'pending':
        return 'gray';
      case 'canceled':
        return 'red';
      default:
        return 'black';
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'command', orderId));
      setOrders(orders.filter(order => order.id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
    } catch (error) {
      setError('Failed to delete order');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Orders List
      </Typography>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Search here..."
              className="search-input"
              name="name"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <Button variant="contained" className="export-button">
          <i className="icon-file-text"></i>Export all orders
        </Button>
      </div>
      <div className="table-container">
        <ul className="table-title">
          <li>Order ID</li>
          <li>Price</li>
          <li>Quantity</li>
          <li>Payment</li>
          <li>Status</li>
          <li>Tracking</li>
          <li>Action</li>
        </ul>
        {filteredOrders.map((order, index) => (
          <ul key={order.id} className={`product-item ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
            <li>{order.id}</li>
            <li>{order.totalPrice}</li>
            <li>{order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)}</li>
            <li>{order.paymentMethod}</li>
            <li style={{ color: getStatusColor(order.status) }}>{order.status || 'Pending'}</li>
            <li>
              <Button variant="outlined" className="tracking-button">Tracking</Button>
            </li>
            <li>
              <IconButton className="action-button" onClick={() => navigate(`/orders/${order.id}`)}>
                <Visibility />
              </IconButton>
              <IconButton className="action-button">
                <Edit />
              </IconButton>
              <IconButton className="action-button delete-button" onClick={() => handleDelete(order.id)}>
                <Delete />
              </IconButton>
            </li>
          </ul>
        ))}
      </div>
      <div className="pagination-container">
        <IconButton className="pagination-button">&lt;</IconButton>
        <IconButton className="pagination-button active">1</IconButton>
        <IconButton className="pagination-button">2</IconButton>
        <IconButton className="pagination-button">3</IconButton>
        <IconButton className="pagination-button">&gt;</IconButton>
      </div>
    </Container>
  );
};

export default OrdersList;
