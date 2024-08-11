import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, TextField } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './SStyle.css';

const AddCategory: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCategoryImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const imageUrl = await uploadImage(categoryImage);
      await addDoc(collection(db, 'category'), {
        name,
        categoryImage: imageUrl,
        subCategories: [],
        tags: []
      });
      navigate('/categories');
    } catch (error) {
      setError('Failed to add category');
    }
  };

  const uploadImage = async (image: File | null): Promise<string> => {
    if (!image) throw new Error('No image file');
    const storageRef = ref(storage, `category_images/${image.name}`);
    await uploadBytes(storageRef, image);
    return await getDownloadURL(storageRef);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Category
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <input
          accept="image/*"
          id="category-image"
          type="file"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="category-image">
          <Button variant="contained" component="span">
            Upload Image
          </Button>
        </label>
        {categoryImage && (
          <div className="image-preview">
            <img src={URL.createObjectURL(categoryImage)} alt="Preview" />
          </div>
        )}
        <Button type="submit" variant="contained" color="primary">
          Add Category
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </form>
    </Container>
  );
};

export default AddCategory;
