import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, FormControlLabel, Switch } from '@mui/material';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeliveryManForm.scss';
import AddressSearch from './adressSearch';
import axios from 'axios';

const RestaurantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [available, setAvailable] = useState(false);
  const [closingTime, setClosingTime] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [openTime, setOpenTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pricePerKm, setPricePerKm] = useState<number>(0);
  const [serviceAvailability, setServiceAvailability] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [acces , setAcces] = useState(false);
  const auth = getAuth();


  useEffect(() => {
    if (role === "restaurant"){
      console.log("me1");
    }
    else {
      console.log("me2");
    }
    if (id) {
      const fetchRestaurant = async () => {
        let docRef;
        if (role === "restaurant"){
          docRef = doc(db, 'shopData', id);
        }
        else {

          docRef = doc(db, 'Reschaine', id);
        }
        
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setDescription(data.description);
          setTag(data.tag);
          setAddress(data.address);
          setAvailable(data.available);
          setClosingTime(data.closingTime);
          setLogoUrl(data.logoPath);
          setOpenTime(data.openTime);
          setPhoneNumber(data.phoneNumber);
          setPricePerKm(data.pricePerKm);
          setServiceAvailability(data.serviceAvailability);
          setEmail(data.email);
          setIsEditing(true);
        } else {
          toast.error('Restaurant non trouvé');
          navigate('/restaurants');
        }
      };

      fetchRestaurant();
    }
  }, [id, navigate]);


  const handleImageUpload = async () => {
    if (logoFile) {
      const logoRef = ref(storage, `logos/${logoFile.name}`);
      await uploadBytes(logoRef, logoFile);
      return await getDownloadURL(logoRef);
    }
    return logoUrl;
  };

 const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
  
    // Validation conditionnelle en fonction du rôle
    
    if (!address) newErrors.address = 'L\'adresse est requise';
    if (!closingTime) newErrors.closingTime = 'L\'heure de fermeture est requise';
    if (!openTime) newErrors.openTime = 'L\'heure d\'ouverture est requise';
    if (new Date(openTime) >= new Date(closingTime)) newErrors.openTime = 'L\'heure d\'ouverture doit être avant l\'heure de fermeture';
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) newErrors.phoneNumber = 'Le numéro de téléphone doit contenir uniquement des chiffres';
    if (pricePerKm <= 0) newErrors.pricePerKm = 'Le prix par km doit être supérieur à 0';
    //if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Un email valide est requis';
    if (!password || password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let userId;
      if (!isEditing && !id){
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      userId = userCredential.user.uid;
      }
      else {userId = localStorage.getItem("restaurantUserId")
      }
      const logoUrl = await handleImageUpload();
      const restaurantData = {
        name,
        description,
        tag,
        address,
        available,
        closingTime,
        logoPath: logoUrl,
        openTime,
        phoneNumber,
        pricePerKm,
        serviceAvailability,
        email,
        userId,
        role: 'restaurant',
        acces:true
      };


      const role = localStorage.getItem('role');

      if (role === 'admin') {
        if (isEditing && id) {
          const docRef = doc(db, 'shopData', id);
          await updateDoc(docRef, restaurantData);
          toast.success('Restaurant mis à jour avec succès !');
        } else {
          await addDoc(collection(db, 'shopData'), restaurantData);
          await sendPasswordResetEmail(auth, email);
          toast.success('Restaurant ajouté avec succès et email de confirmation envoyé !');
          navigate('/dashboard');
        }
      } else if (role === 'restaurant') {
        // Ajouter le restaurant à une liste spécifique pour l'utilisateur restaurant connecté
        const myid = localStorage.getItem('restaurantUserId')
        const restaurantsCollection = collection(db, 'shopData');
        const q = query(restaurantsCollection, where('userId', '==', myid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          toast.error('Aucun document trouvé');
        return;
        }
      console.log("added 216")
      const mydocSnapshot = querySnapshot.docs[0];
      const data = mydocSnapshot.data();
      const myrestaurantData = {
        name: data.name , 
        description : data.description,
        tag : data.tag,
        address,
        available,
        closingTime,
        logoPath: data.logoPath ,
        openTime,
        phoneNumber,
        pricePerKm,
        serviceAvailability,
        email,
        userId,
        resId : data.userId,
        role: 'sousrestaurant',
        acces
      };
      if (isEditing && id) {
        const docRef = doc(db, 'Reschaine', id);
        await updateDoc(docRef, myrestaurantData);
        const localStorageKey = `restaurant-${id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(myrestaurantData));
        toast.success('Restaurant mis à jour avec succès !');
      } else {
      await addDoc(collection(db, 'Reschaine'), myrestaurantData);
      await sendPasswordResetEmail(auth, email);
      toast.success('Restaurant ajouté avec succès et email de confirmation envoyé !');

      }
    }

      setName('');
      setDescription('');
      setTag('');
      setAddress('');
      setAvailable(false);
      setClosingTime('');
      setLogoFile(null);
      setOpenTime('');
      setPhoneNumber('');
      setPricePerKm(0);
      setServiceAvailability(false);
      setLogoUrl('');
      setEmail('');
      setPassword('');
      setAcces(false)

      navigate('/dashboard');
    } catch (error) {
      toast.error("Erreur lors de l'ajout/mise à jour du restaurant");
    }
  };
  const isRestaurant = localStorage.getItem("role") === 'restaurant';
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null);
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: 'AIzaSyDFUn6EuiuNTZ0TsETQ-BhCpmMcvOA7FME'
        }
      });
      const result = response.data.results[0];
      setAddress(result.formatted_address);
    } catch (error) {
      console.error('Erreur lors de la récupération de l’adresse:', error);
    }
  };

  const handleLocationSelect = (location: google.maps.LatLng) => {
    setSelectedLocation(location);
    fetchAddress(location.lat(), location.lng());
  };

  return (
    <Container>
      <ToastContainer />
      <Typography variant="h4" marginBottom={5} gutterBottom>
        {isEditing ? 'Modifier le Restaurant' : 'Ajouter un Restaurant'}
      </Typography>
      <form onSubmit={handleSubmit} className="form">
        {!isRestaurant && (
          <>
        <div className="form-group">
          <label className="form-label">Nom</label>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <TextField
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            error={!!errors.description}
            helperText={errors.description}
          />
        </div>
        </>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <TextField
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <TextField
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            type="password"
            error={!!errors.password}
            helperText={errors.password}
          />
        </div>
          {!isRestaurant &&(
            <>
        <div className="form-group">
          <label className="form-label">Tag</label>
          <TextField
            fullWidth
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            margin="normal"
            required
            error={!!errors.tag}
            helperText={errors.tag}
          />
        </div>
        </>
          )}
        <div className="form-group">
          <label className="form-label">Adresse</label>
          <AddressSearch onSelect={handleLocationSelect} />
          <TextField
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            margin="normal"
            required
            error={!!errors.address}
            helperText={errors.address}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Disponible (le client saura si le restaurant est ouvert)</label>
          <FormControlLabel
            control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} 
            color="default" // This can be customized in styles
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: '#FF9800', // Change the thumb color
                },
                '& .Mui-checked .MuiSwitch-thumb': {
                  backgroundColor: '#FF5722', // Change the thumb color when checked
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#FFC107', // Change the track color
                },
                '& .Mui-checked .MuiSwitch-track': {
                  backgroundColor: '#FF9800', // Change the track color when checked
                },
              }}
            />}
            label=""
          />
        </div>

        <div className="form-group">
          <label className="form-label">Heure d'ouverture</label>
          <TextField
            type="time"
            fullWidth
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.openTime}
            helperText={errors.openTime}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Heure de fermeture</label>
          <TextField
            type="time"
            fullWidth
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.closingTime}
            helperText={errors.closingTime}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Numéro de téléphone</label>
          <TextField
            fullWidth
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            required
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Prix par km</label>
          <TextField
            type="number"
            fullWidth
            value={pricePerKm}
            onChange={(e) => setPricePerKm(Number(e.target.value))}
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
            required
            error={!!errors.pricePerKm}
            helperText={errors.pricePerKm}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Disponibilité du service (indique si le service de livraison est disponible)</label>
          <FormControlLabel
            control={<Switch checked={serviceAvailability} onChange={(e) => setServiceAvailability(e.target.checked)} 
            color="default" // This can be customized in styles
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: '#FF9800', // Change the thumb color
              },
              '& .Mui-checked .MuiSwitch-thumb': {
                backgroundColor: '#FF5722', // Change the thumb color when checked
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#FFC107', // Change the track color
              },
              '& .Mui-checked .MuiSwitch-track': {
                backgroundColor: '#FF9800', // Change the track color when checked
              },
            }}/>}
            label=""
          />
        </div>
        <div className="form-group">
          <label className="form-label">Le restaurant a la possibilité de gérer les codes promos ?</label>
          <FormControlLabel
            control={<Switch checked={acces} onChange={(e) => setAcces(e.target.checked)} 
            color="default" // This can be customized in styles
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: '#FF9800', // Change the thumb color
              },
              '& .Mui-checked .MuiSwitch-thumb': {
                backgroundColor: '#FF5722', // Change the thumb color when checked
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#FFC107', // Change the track color
              },
              '& .Mui-checked .MuiSwitch-track': {
                backgroundColor: '#FF9800', // Change the track color when checked
              },
            }}/>}
            label=""
          />
        </div>
        {!isRestaurant && (
          <>
        <div className="form-group">
          <label className="form-label">Logo du Restaurant</label>
          <Dropzone onDrop={(acceptedFiles) => setLogoFile(acceptedFiles[0])}>
            {({ getRootProps, getInputProps }) => (
              <section className="dropzone">
                <div {...getRootProps()} className="dropzone-area">
                  <input {...getInputProps()} />
                  <Typography>Déposez vos images ici ou sélectionnez <span style={{ color: '#FF9A40' }}>cliquez pour parcourir</span></Typography>
                </div>
              </section>
            )}
          </Dropzone>
          {errors.logoPath && <Typography color="error">{errors.logoPath}</Typography>}
        </div>
        </>
        )}
        <Button id='exporter' type="submit" variant="contained" className="submit-button">
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </form>
    </Container>
  );
};

export default RestaurantForm;
