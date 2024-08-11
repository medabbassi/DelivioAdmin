import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Box, Typography, CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import './OrderDetails.css'; // Import the CSS file

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  backgroundColor: '#f4f6f8',
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#fff',
  borderRadius: '8px',
}));

const ItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const TrackOrderButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#e3f2fd',
  color: '#1e88e5',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#bbdefb',
  },
}));

interface OrderItem {
  productName: string;
  quantity: number;
  productPrice: string;
  productImage: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: string;
  status: string;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  deliveryManId?: string;
}

interface DeliveryMan {
  id: string;
  nom: string;
}

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        const orderDoc = doc(db, 'command', orderId);
        const orderSnapshot = await getDoc(orderDoc);
        if (orderSnapshot.exists()) {
          const data = orderSnapshot.data() as Order;
          setOrder({
            id: orderId,
            items: data.items,
            totalPrice: data.totalPrice,
            status: data.status || 'Pending',
            createdAt: data.createdAt,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            deliveryManId: data.deliveryManId,
          });
          setSelectedDeliveryMan(data.deliveryManId || '');
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDeliveryMen = async () => {
      try {
        const deliveryMenCollection = collection(db, 'deliveryMen');
        const deliveryMenSnapshot = await getDocs(deliveryMenCollection);
        const deliveryMenList: DeliveryMan[] = deliveryMenSnapshot.docs.map(doc => ({
          id: doc.id,
          nom: doc.data().nom,
        }));
        setDeliveryMen(deliveryMenList);
      } catch (error) {
        console.error('Error fetching delivery men:', error);
      }
    };

    fetchOrderDetails();
    fetchDeliveryMen();
  }, [orderId]);

  const handleAssignDeliveryMan = async () => {
    if (order && selectedDeliveryMan) {
      try {
        await updateDoc(doc(db, 'command', order.id), {
          deliveryManId: selectedDeliveryMan,
          status: 'In Progress',
        });
        setOrder({ ...order, deliveryManId: selectedDeliveryMan, status: 'In Progress' });
        setOpenDialog(true);
      } catch (error) {
        console.error('Error assigning delivery man:', error);
        alert('Failed to assign delivery man.');
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!order) {
    return <Typography color="error">No order details found</Typography>;
  }

  return (
    <Container>
      <Box sx={{ width: '65%' }}>
        <Section>
          <Typography variant="h6">All items</Typography>
          {order.items.map((item, index) => (
            <ItemBox key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{ width: 50, height: 50, borderRadius: '8px' }}
                  />
                )}
                <Box>
                  <Typography variant="body2">Product name</Typography>
                  <Typography variant="h6">{item.productName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="h6">{item.quantity}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Price (€)</Typography>
                <Typography variant="h6">{item.productPrice}€</Typography>
              </Box>
            </ItemBox>
          ))}
        </Section>
        <Section>
          <Typography variant="h6">Cart Totals</Typography>
          <SummaryBox>
            <Typography>Subtotal:</Typography>
            <Typography>{order.totalPrice}€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Shipping:</Typography>
            <Typography>10.00€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Tax (GST):</Typography>
            <Typography>5.00€</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Total price:</Typography>
            <Typography sx={{ color: 'red' }}>{parseFloat(order.totalPrice) + 15.00}€</Typography>
          </SummaryBox>
        </Section>
      </Box>
      <Box sx={{ width: '30%' }}>
        <Section>
          <Typography variant="h6">Summary</Typography>
          <SummaryBox>
            <Typography>Order ID:</Typography>
            <Typography>{order.id}</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Date:</Typography>
            <Typography>{order.createdAt}</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography>Total:</Typography>
            <Typography sx={{ color: 'red' }}>{parseFloat(order.totalPrice) + 15.00}€</Typography>
          </SummaryBox>
        </Section>
        <Section>
          <Typography variant="h6">Shipping Address</Typography>
          <Typography>{order.shippingAddress}</Typography>
        </Section>
        <Section>
          <Typography variant="h6">Payment Method</Typography>
          <Typography>{order.paymentMethod}</Typography>
        </Section>
        <Section>
          <Typography variant="h6">Expected Date Of Delivery</Typography>
          <Typography sx={{ color: 'green' }}>{order.createdAt}</Typography>
          <TrackOrderButton variant="contained">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Track order</Typography>
            </Box>
          </TrackOrderButton>
        </Section>
        <Section>
          <Typography variant="h6">Assign Delivery Man</Typography>
          <FormControl fullWidth>
            <InputLabel>Delivery Man</InputLabel>
            <Select
              value={selectedDeliveryMan}
              onChange={(e) => setSelectedDeliveryMan(e.target.value as string)}
              required
            >
              {deliveryMen.map((man) => (
                <MenuItem key={man.id} value={man.id}>{man.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAssignDeliveryMan} sx={{ marginTop: 2 }}>
            Assign
          </Button>
        </Section>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delivery Man Assigned</DialogTitle>
        <DialogContent>
          <Typography>The order will be delivered by the assigned delivery man.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetails;
