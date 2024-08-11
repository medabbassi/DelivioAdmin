import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './SStyle.css';

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

const AddProduct: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList: Category[] = categorySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCategories(categoryList);

      const subCategorySnapshot = await getDocs(collection(db, 'subcategories'));
      const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        categoryId: doc.data().categoryId,
      }));
      setSubCategories(subCategoryList);

      setLoading(false);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      const filtered = subCategories.filter(subCat => subCat.categoryId === category);
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [category, subCategories]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProductImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!productName || !productDescription || !productPrice || !category || !subCategory || !productImage) {
      setError('Please fill out all fields');
      return;
    }

    try {
      const imageRef = ref(storage, `product_images/${productImage.name}`);
      await uploadBytes(imageRef, productImage);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'products'), {
        productName,
        productDescription,
        productPrice,
        productCategory: category,
        productSubCategory: subCategory,
        productImage: imageUrl,
        available: true,
        added_at: Date.now(),
      });

      setOpen(true);
      setProductName('');
      setProductDescription('');
      setProductPrice(null);
      setCategory('');
      setSubCategory('');
      setProductImage(null);
    } catch (error) {
      setError('Failed to add product');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Product Description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Product Price"
          type="number"
          value={productPrice ?? ''}
          onChange={(e) => setProductPrice(parseFloat(e.target.value))}
          required
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            required
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Sub-Category</InputLabel>
          <Select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value as string)}
            required
          >
            {filteredSubCategories.map(subCat => (
              <MenuItem key={subCat.id} value={subCat.id}>{subCat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="upload-image-container">
          <input
            accept="image/*"
            id="product-image"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="product-image" className="upload-label">
            <div className="upload-box">
              <span>Drop your images here or select <span className="click-to-browse">click to browse</span></span>
            </div>
          </label>
          {productImage && (
            <div className="image-preview">
              <img src={URL.createObjectURL(productImage)} alt="Preview" />
            </div>
          )}
        </div>
        <Button type="submit" variant="contained" color="primary">
          Add Product
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </form>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Product added successfully!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddProduct;
