import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, IconButton, Tooltip} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './DeliveryMenList.css'; 
import './restaurantList.css'; 
 
interface Restaurant {
  id: string;
  address: string;
  available: boolean;
  closingTime: string;
  logoPath: string;
  name: string; 
  openTime: string;
  phoneNumber: string;
  pricePerKm: number;
  serviceAvailability: boolean;
  role: string;
}
 
const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const myrole = localStorage.getItem('role');
  const isDisabled = myrole !== 'admin' && myrole !== 'restaurant' ;
 
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantCollection = collection(db, 'shopData');
        const reschaineCollection = collection(db, 'Reschaine');
        let resQuery , reschaineQuery;
    
        // Si l'utilisateur est un restaurant, filtrer par restaurantId
        if (localStorage.getItem('role') === 'restaurant') {
          const resId = localStorage.getItem('restaurantUserId')
          console.log("product of rest", resId)
          resQuery = query(
            restaurantCollection,
            where('userId', '==', resId),
            //orderBy('date', 'desc') // Trier par date descendante
          );
          reschaineQuery = query(
            reschaineCollection,
            where('resId', '==', resId)
          );
        }
        else if (localStorage.getItem('role') === 'sousrestaurant'){
          const resId = localStorage.getItem('ResPrincipale')
          resQuery = query(
            restaurantCollection,
            where('userId', '==', resId),);
            reschaineQuery = query(
              reschaineCollection,
              where('resId', '==', resId)
            );
          
        } else {
          // Si l'utilisateur n'est pas un restaurant, afficher toutes les commandes
          resQuery = query(restaurantCollection);
          reschaineQuery = query(reschaineCollection);
        }
        const restaurantSnapshot = await getDocs(resQuery);
        const restaurantList: Restaurant[] = restaurantSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Restaurant[];

        const reschaineSnapshot = await getDocs(reschaineQuery);
      const reschaineList: Restaurant[] = reschaineSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[];

      const combinedRestaurants = [...restaurantList, ...reschaineList];
        setRestaurants(combinedRestaurants);
        setFilteredRestaurants(combinedRestaurants);
      } catch (error) {
        setError('Échec du chargement des restaurants');
      } finally {
        setLoading(false);
      }
    };
 
    fetchRestaurants();
  }, []);
 
  useEffect(() => {
    const filtered = restaurants.filter(restaurant =>
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
    setFilteredRestaurants(filtered);
    setCurrentPage(1); 
  }, [searchTerm, restaurants]);
 
  const handleDelete = async (id: string) => {
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
        await deleteDoc(doc(db, 'shopData', id));
        setRestaurants(restaurants.filter(restaurant => restaurant.id !== id));
        setFilteredRestaurants(filteredRestaurants.filter(restaurant => restaurant.id !== id));
      }
    } catch (error) {
      setError('Échec de la suppression du restaurant');
    }
  };
 
  const handleEditRestaurant = (id: string, role: string) => {
    navigate(`/restaurants/edit/${id}`, { state: { role } });
    console.log('Navigating to edit restaurant with id:', id, 'and type:', role);
  };
 
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 
  const indexOfLastRestaurant = currentPage * itemsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
 
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const paginationItems = [];
     paginationItems.push(
        <IconButton
            key={1}
            className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => paginate(1)}
        >
            1
        </IconButton>
    );
    if (totalPages <= 1) return paginationItems; 
 
    if (currentPage > 3) {
        paginationItems.push(<span key="start-ellipsis">...</span>);
    }
 
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        paginationItems.push(
            <IconButton
                key={i}
                className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                onClick={() => paginate(i)}
            >
                {i}
            </IconButton>
        );
    }
 
    if (currentPage < totalPages - 2) {
        paginationItems.push(<span key="end-ellipsis">...</span>);
    }
 
    paginationItems.push(
        <IconButton
            key={totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
            onClick={() => paginate(totalPages)}
        >
            {totalPages}
        </IconButton>
    );
 
    return paginationItems;
  };
 
 
  if (loading) {
    return <Typography>Chargement...</Typography>;
  }
 
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
 
  return (
    <div className='restaurant-container'>
      <Container>
      <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>
        Liste des restaurants
      </Typography>
      <div className="search-export-container"> 
      <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Recherchez ici..."
              className="search-input"
              name="name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </fieldset>
          <div className="button-submit">
            <button type="submit" className="search-button">
              <i className="icon-search"></i>
            </button>
          </div>
        </form>
        <div className="add-buttons">
          <Tooltip className='custom-tooltip' title="Ajouter un nouveau restaurant" arrow>
          <Button
            id="exporter"
            variant="contained"
            className="add-button"
            onClick={e => {
              if (isDisabled) {
                e.preventDefault();
              } else {
                navigate('/restaurants/new');
              }
            }}
            style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            > Ajouter
          </Button>
          </Tooltip>
        </div>
      </div>
      <div className="table-container">
        <table className="delivery-men-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nom</th> 
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ouvert</th> 
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRestaurants.map((restaurant, index) => (
              <tr key={restaurant.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <img src={restaurant.logoPath} alt="Logo" className="restaurant-logo" />
                </td>
                <td>{restaurant.name}</td> 
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{restaurant.address}</td>
                <td>{restaurant.phoneNumber}</td>
                <td>{restaurant.available ? 'Oui' : 'Non'}</td>
                <td>
                  <IconButton
                    className="action-button"
                    onClick={() => handleEditRestaurant(restaurant.id , restaurant.role)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    className="action-button delete-button"
                    onClick={() => handleDelete(restaurant.id)}
                  >
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </IconButton>
        {renderPagination()}
        <IconButton
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </IconButton>
      </div>
      </Container>
    </div>
  );
};
 
export default RestaurantList;