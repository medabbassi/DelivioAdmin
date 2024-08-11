import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DeliveryMenList.css';

interface DeliveryMan {
  id: string;
  email: string;
  nom: string;
  password: string;
  phonenumber: number;
  photo: string;
}

const DeliveryMenList: React.FC = () => {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryMen = async () => {
      try {
        const deliveryMenCollection = collection(db, 'deliveryMen');
        const deliveryMenSnapshot = await getDocs(deliveryMenCollection);
        const deliveryMenList: DeliveryMan[] = deliveryMenSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DeliveryMan[];
        setDeliveryMen(deliveryMenList);
      } catch (error) {
        setError('Failed to fetch delivery men');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryMen();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deliveryMen', id));
      setDeliveryMen(deliveryMen.filter(man => man.id !== id));
    } catch (error) {
      console.error('Error deleting delivery man:', error);
      alert('Failed to delete delivery man');
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
      
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Search here..."
              className="search-input"
              name="name"
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <Button variant="contained" className="export-button">
          <i className="icon-file-text"></i>Export all delivery men
        </Button>
      </div>
      <div className="table-container">
        <ul className="table-title">
          <li>Photo</li>
          <li>ID</li>
          <li>Name</li>
          <li>Email</li>
          <li>Phone Number</li>
          <li>Action</li>
        </ul>
        {deliveryMen.map((deliveryMan, index) => (
          <ul key={deliveryMan.id} className={`product-item ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
            <li>
              <img src={deliveryMan.photo} alt={deliveryMan.nom} className="delivery-man-photo" />
            </li>
            <li>{deliveryMan.id}</li>
            <li>{deliveryMan.nom}</li>
            <li>{deliveryMan.email}</li>
            <li>{deliveryMan.phonenumber}</li>
            <li>
              <IconButton className="action-button" onClick={() => navigate(`/delivery-men/${deliveryMan.id}`)}>
                <Visibility />
              </IconButton>
              <IconButton className="action-button" onClick={() => navigate(`/delivery-men/edit/${deliveryMan.id}`)}>
                <Edit />
              </IconButton>
              <IconButton className="action-button delete-button" onClick={() => handleDelete(deliveryMan.id)}>
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

export default DeliveryMenList;
