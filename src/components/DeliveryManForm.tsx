import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeliveryManForm.scss';

const DeliveryManForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !name || !password || !phoneNumber || !photo) {
      setError('All fields are required');
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `deliveryMenPhotos/${photo.name}`);
      await uploadBytes(storageRef, photo);
      const photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'deliveryMen'), {
        email,
        name,
        password,
        phoneNumber,
        photo: photoURL,
      });

      // Send email to delivery man
      await sendEmail(email, name);

      toast.success('Delivery man added successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate('/delivery-men'), 5000);
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Failed to add delivery man');
    }
  };

  const sendEmail = async (email: string, name: string) => {
    // Email sending logic (using an email service like SendGrid, NodeMailer, etc.)
    console.log(`Sending email to ${email} for delivery man ${name}`);
  };

  return (
    <Container className="delivery-man-form">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Phone Number"
          fullWidth
          margin="normal"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <div className="upload-photo">
          <input
            accept="image/*"
            type="file"
            id="photo-upload"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <label htmlFor="photo-upload">
            <div className="drop-area">
              {photoURL ? (
                <img src={photoURL} alt="Photo Preview" className="photo-preview" />
              ) : (
                <div className="drop-text">
                  <span>Drop your images here or select </span>
                  <span className="click-browse">click to browse</span>
                </div>
              )}
            </div>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <Button type="submit" variant="contained" color="primary">
            Add Delivery Man
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate('/delivery-men')}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default DeliveryManForm;
