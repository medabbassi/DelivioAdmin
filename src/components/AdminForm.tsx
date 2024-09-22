import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, FormControlLabel, Switch } from '@mui/material';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeliveryManForm.scss';

const AdminForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    if (id) {
      const fetchAdmin = async () => {
        const docRef = doc(db, 'admin', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setPrenom(data.prenom);
          setPhoneNumber(data.phoneNumber);
          setEmail(data.email);
          setIsEditing(true);
        } else {
          toast.error('Restaurant non trouvé');
          navigate('/dashboard');
        }
      };

      fetchAdmin();
    }
  }, [id, navigate]);


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = 'Le nom du restaurant est requis';
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) newErrors.phoneNumber = 'Le numéro de téléphone doit contenir uniquement des chiffres';
    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Un email valide est requis';
    if (!password || password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

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
      };

      if (isEditing && id) {
        const docRef = doc(db, 'shopData', id);
        await updateDoc(docRef, restaurantData);
        toast.success('Restaurant mis à jour avec succès !');
      } else {
        await addDoc(collection(db, 'shopData'), restaurantData);

        // Send password reset email to the new restaurant owner
        await sendPasswordResetEmail(auth, email);

        toast.success('Restaurant ajouté avec succès et email de confirmation envoyé!');
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

      navigate('/restaurants'); 
    } catch (error) {
      toast.error('Erreur lors de l\'ajout/mise à jour du restaurant');
    }
  };*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
  
      const adminData = {
        name,
        prenom,
        phoneNumber,
        email,
        userId,
        role: 'admin', // Ajoutez ce champ pour différencier le type d'utilisateur
      };
  
      if (isEditing && id) {
        const docRef = doc(db, 'admin', id);
        await updateDoc(docRef, adminData);
        toast.success('Restaurant mis à jour avec succès !');
      } else {
        await addDoc(collection(db, 'admin'), adminData);
  
        // Envoyer un email de réinitialisation de mot de passe au nouveau propriétaire de restaurant
        await sendPasswordResetEmail(auth, email);
  
        toast.success('Restaurant ajouté avec succès et email de confirmation envoyé!');
      }
  
      // Réinitialiser les champs
      setName('');
      setPrenom('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      console.log("added");
  
      navigate('/dashboard');
    } catch (error) {
      toast.error("Erreur lors de l'ajout/mise à jour du restaurant");
    }
  };
  

  return (
    <Container>
      <Typography variant="h4" marginBottom={5} gutterBottom>
        {isEditing ? 'Modifier le Restaurant' : 'Ajouter un Restaurant'}
      </Typography>
      <form onSubmit={handleSubmit} className="form">
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
          <label className="form-label">Prénom</label>
          <TextField
            fullWidth
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            margin="normal"
            required
            error={!!errors.description}
            helperText={errors.description}
          />
        </div>
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


        <Button id='exporter' type="submit" variant="contained" className="submit-button">
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default AdminForm;
