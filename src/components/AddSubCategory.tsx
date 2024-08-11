import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SStyle.css';

const AddSubCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subCategoryName, setSubCategoryName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (selectedCategory && subCategoryName) {
        await addDoc(collection(db, 'subcategories'), {
          name: subCategoryName,
          categoryId: selectedCategory
        });
        setError(null);
        alert('Subcategory added successfully!');
        setSelectedCategory('');
        setSubCategoryName('');
      } else {
        setError('Please select a category and enter a subcategory name');
      }
    } catch (error) {
      setError('Failed to add subcategory');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add SubCategory
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            required
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="SubCategory Name"
          value={subCategoryName}
          onChange={(e) => setSubCategoryName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Add SubCategory
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </form>
    </Container>
  );
};

export default AddSubCategory;
