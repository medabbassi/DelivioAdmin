import { useEffect, useState } from 'react';
import loginimg from '../assets/images/loginimg.png';
import logo from '../assets/images/Deliviofull.png';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './profile.css'
import Header from './Header';

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
    tag: string;
    email: string;
    description: string;
  }

const Profile: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'restaurant' | 'sousrestaurant' >('admin');
    const auth = getAuth();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
          try {
            const idRestaurant = localStorage.getItem('restaurantId');
            const role = localStorage.getItem('role');
      
            if (!idRestaurant) {
              setError('ID du restaurant manquant');
              setLoading(false);
              return;
            }
      
            let restaurantRef;
      
            if (role === 'restaurant') {
              // Accéder au document spécifique du restaurant
              restaurantRef = doc(db, 'shopData', idRestaurant);
            } else {
              // Accéder au document spécifique du sous-restaurant (chaine)
              restaurantRef = doc(db, 'Reschaine', idRestaurant);
            }
      
            const restaurantSnapshot = await getDoc(restaurantRef);
      
            if (restaurantSnapshot.exists()) {
              const data = restaurantSnapshot.data() as Restaurant;
              setRestaurant({
                ...data
              });
            } else {
              setError('Restaurant introuvable');
              setRestaurant(null);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du restaurant :', error);
            setError('Échec du chargement du restaurant');
          } finally {
            setLoading(false);
          }
        };
      
        fetchRestaurant();
      }, []);
      
     



    return (
        <>
        <div className="page-wraper">
        <div className="page-content">
            <div className="my-wt-bnr-inr my-overlay-wraper my-bg-center" style={{backgroundColor:"#fff8f2"}}>
                <div className="my-overlay-main my-site-bg-white my-opacity-01"></div>
                <div className="container">
                    <div className="my-wt-bnr-inr-entry">
                        <div className="my-banner-title-outer">
                            <div className="my-banner-title-name">
                                <h2 className="my-wt-title">Profile du restaurnat</h2>
                            </div>
                        </div>                                               
                            <div>
                                <ul className="my-wt-breadcrumb breadcrumb-style-2">
                                    <li><a href="/dashboard">Acceuil</a></li>
                                    <li>Profile du restaurnat</li>
                                </ul>
                            </div>                      
                    </div>
                </div>
            </div>
            <div className="my-section-full p-t120  p-b90 my-site-bg-white">


                

                <div className="container">
                    <div className="row">
                        
                        <div className="col-xl-3 col-lg-4 col-md-12 rightSidebar my-m-b30">

                            <div className="my-side-bar-st-1">
                                
                                <div className="my-twm-candidate-profile-pic">
                                    
                                    <img src={restaurant?.logoPath} alt=""/>
                                    
                                </div>

                                <div className="my-twm-mid-content my-text-center">
                                    <a href="/dashboard" className="my-twm-job-title">
                                        <h4>{restaurant?.name}</h4>
                                    </a>
                                    <p>{restaurant?.tag}</p>
                                </div>
                                
                            </div>

                        </div>

                        <div className="col-xl-9 col-lg-8 col-md-12 my-m-b30">
                            <div className="my-twm-right-section-panel my-site-bg-gray">
                                <form>
                                    <div className="my-panel my-panel-default">
                                        <div className="my-panel-heading my-wt-panel-heading my-p-a20">
                                            <h4 className="my-panel-tittle my-m-a0">Restaurant Profile</h4>
                                        </div>
                                        <div className="panel-body wt-panel-body my-p-a20 my-m-b30 ">
                                            
                                            <div className="row">
                                                                
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Nom</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.name} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-building"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Spécialité</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.tag} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-tags"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Téléphone</label>
                                                            <div className="my-ls-inputicon-box"> 
                                                                <input className="myp-form-control" name="company_phone" type="text" value={restaurant?.phoneNumber} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-phone-alt"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Adresse email</label>
                                                            <div className="my-ls-inputicon-box"> 
                                                                <input className="myp-form-control" name="company_Email" type="email" value={restaurant?.email} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fas fa-at"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Heure d'ouverture</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.openTime} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-clock"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Heure de fermeture</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.closingTime} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-clock"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Disponible</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.available ? "Disponible" : "Non disponible"} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-circle"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Service de livraison</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.serviceAvailability ? "Disponible" : "Non disponible"} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-bicycle"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Prix par km</label>
                                                            <div className="my-ls-inputicon-box" > 
                                                                <input className="myp-form-control" name="company_name" type="text" value={restaurant?.pricePerKm} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fa fa-euro-sign"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                                        <div className="my-form-group city-outer-bx has-feedback">
                                                            <label className='myLabel'>Adresse</label>
                                                            <div className="my-ls-inputicon-box">  
                                                                <input className="myp-form-control" name="company_since" type="text" value={restaurant?.address} disabled style={{backgroundColor:"#fef7f0"}}/>
                                                                <i className="fs-input-icon fas fa-map-marker-alt"></i>
                                                            </div>
                                                            
                                                        </div>
                                                    </div>                 
                                                    <div className="col-md-12">
                                                        <div className="my-form-group">
                                                            <label className='myLabel'>Description</label>
                                                            <textarea className="myp-form-control" value={restaurant?.description} disabled></textarea>
                                                        </div>
                                                    </div>
                                                                                        
                                                
                                            </div>
                                                    
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>   
          
            
     
        </div>
		<button className="scroltop"><span className="fa fa-angle-up  relative" id="btn-vibrate"></span></button>


 	</div>
     </>
        
);
};

export default Profile;
