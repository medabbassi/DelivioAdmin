import { useState, useEffect } from 'react';
import loginimg from '../assets/images/loginimg.png';
import logo from '../assets/images/Deliviofull.png';
import './loginres.css';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'restaurant' | 'sousrestaurant' >('restaurant');
    const [showPassword, setShowPassword] = useState(false);
    const [restaurants, setRestaurants] = useState<{ id: string, name: string }[]>([]);
    const [isChecked, setIsChecked] = useState(false);
    const auth = getAuth();
    const navigate = useNavigate();
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsChecked(checked);
        setRole(checked ? 'sousrestaurant' : 'restaurant');
      };

    

    const handleLogin = async () => {
        try {
            // Connexion avec Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            console.log(userId, userCredential.user.email);
            
            // Déterminer la collection Firestore en fonction du rôle sélectionné
            //const collectionName = role === 'admin' ? 'admin' : 'shopData';
            let collectionName;
            if (role === 'admin'){
                collectionName = 'admin'
            }
            else if (role === 'restaurant'){
                collectionName = 'shopData'
            }
            else {
                collectionName = 'Reschaine'
            }
            const usersCollectionRef = collection(db, collectionName);
            const q = query(usersCollectionRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            console.log(collectionName)
            console.log(querySnapshot.empty);
            
            // Vérifier si des documents ont été trouvés
            if (!querySnapshot.empty) {
                const userDocSnap = querySnapshot.docs[0];
                const userData = userDocSnap.data();
                console.log(userData);
                localStorage.setItem('role',role);
                localStorage.setItem('userName',userData.name ) 
    
                // Vérifier le rôle de l'utilisateur et rediriger en conséquence
                if (userData.role === role) {
                    if (role === 'admin') {
                        navigate('/dashboard');
                    } else if (role === 'restaurant') {
                        const restaurantUserId = userData.userId; 
                        const restaurantId = userDocSnap.id;
                        localStorage.setItem('restaurantUserId', restaurantUserId); 
                        localStorage.setItem('restaurantId', restaurantId); 
                        // Stockage de l'ID du restaurant
                        navigate('/dashboard');
                    }
                    else if (role === 'sousrestaurant') {
                        const restaurantUserId = userData.userId; 
                        const resPrincipal = userData.resId;
                        const access = userData.acces
                        const restaurantId = userDocSnap.id;
                        localStorage.setItem('restaurantUserId', restaurantUserId); 
                        localStorage.setItem('restaurantId', restaurantId); 
                        localStorage.setItem("ResPrincipale", resPrincipal)
                        localStorage.setItem("acces", String(access))
                        // Stockage de l'ID du restaurant
                        navigate('/dashboard');
                    }
                } else {
                    toast.error('Rôle incorrect.');
                }
            } else {
                toast.error('Aucune donnée utilisateur trouvée.');
            }
        } catch (error) {
            toast.error("Veuillez vérifier votre email ou votre mot de passe" );
            console.error('Erreur lors de la connexion:', error);
        }
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="page-wraper">
            <ToastContainer />
            <div className="page-content">
                <div className="section-full site-bg-white">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-5 twm-log-reg-media-wrap">
                                <div className="twm-log-reg-media">
                                    <div className="twm-l-media">
                                        <img src={loginimg} alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-7">
                                <div className="twm-log-reg-form-wrap">
                                    <div className="twm-log-reg-logo-head">
                                        <a href="">
                                            <img src={logo} alt="" className="logo" />
                                        </a>
                                    </div>
                                    <div className="twm-log-reg-inner">
                                        <div className="twm-log-reg-head">
                                            <div className="twm-log-reg-logo">
                                                <span className="log-reg-form-title">Se Connecter</span>
                                            </div>
                                        </div>
                                        <div className="twm-tabs-style-2">
                                            <ul className="nav nav-tabs" id="myTab2" role="tablist">
                                                <li className="nav-item">
                                                    <button 
                                                        className={`nav-link ${role === 'admin' ? 'active' : ''}`} 
                                                        type="button" 
                                                        onClick={() => setRole('admin')}
                                                    >
                                                        <i className="fas fa-user-tie"></i>Administrateur
                                                    </button>
                                                </li>
                                                <li className="nav-item">
                                                    <button 
                                                        className={`nav-link ${role === 'restaurant'  ? 'active' : ''}`} 
                                                        type="button" 
                                                        onClick={() => setRole('restaurant')}
                                                    >
                                                        <i className="fas fa-utensils"></i>Restaurant
                                                    </button>
                                                </li>
                                            </ul>
                                            <div className="tab-content" id="myTab2Content">
                                                <div className={`tab-pane ${role === 'admin' ? 'show active' : 'fade'}`} id="twm-login-candidate">
                                                    <div className="row" style={{ justifyContent: "center" }}>
                                                        <div className="col-lg-9">
                                                            <div className="my-form-group my-mb">
                                                                <input
                                                                    name="email"
                                                                    type="email"
                                                                    className="my-form-control"
                                                                    placeholder="Email*"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-9">
                                                            <div className="my-form-group my-mb">
                                                                <input
                                                                    name="password"
                                                                    type={showPassword ? 'text' : 'password'}
                                                                    className="my-form-control"
                                                                    placeholder="Mot de passe*"
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-7">
                                                            <div className="my-form-group">
                                                                <button 
                                                                    type="button" 
                                                                    className="my-site-button"
                                                                    onClick={handleLogin}
                                                                >
                                                                    Se Connecter
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`tab-pane ${role === 'restaurant' || role === 'sousrestaurant' ? 'show active' : 'fade'}`} id="twm-login-Employer">
                                                    <div className="row" style={{ justifyContent: "center" }}>
                                                    <div className="col-lg-9">
                                                        <div className="my-twm-forgot-wrap">
                                                            <div className="my-form-group my-mb-3">
                                                                <div className="my-form-check">
                                                                    <input type="checkbox" className="my-form-check-input" checked={isChecked} onChange={handleCheckboxChange}/>
                                                                    <label className="my-form-check-label my-rem-forgot" >Je connecte en tant que sous resataurant</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                        <div className="col-lg-9">
                                                            <div className="my-form-group my-mb">
                                                                <input
                                                                    name="email"
                                                                    type="email"
                                                                    className="my-form-control"
                                                                    placeholder="Email*"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-9">
                                                            <div className="my-form-group my-mb" style={{position:"relative"}}>
                                                                <input
                                                                    name="password"
                                                                    type={showPassword ? 'text' : 'password'}
                                                                    className="my-form-control"
                                                                    placeholder="Mot de passe*"
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-7">
                                                            <div className="my-form-group">
                                                                <button 
                                                                    type="button" 
                                                                    className="my-site-button"
                                                                    onClick={handleLogin}
                                                                >
                                                                    Se Connecter
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
