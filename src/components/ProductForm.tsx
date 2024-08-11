import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
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
  categoryId: string;  // Add this line
}

const ProductForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoryList);

      const subCategorySnapshot = await getDocs(collection(db, 'subcategories'));
      const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        categoryId: doc.data().categoryId,
      }));
      setSubCategories(subCategoryList);

      if (productId) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProductName(productData.productName);
          setProductDescription(productData.productDescription);
          setProductPrice(productData.productPrice);
          setCategory(productData.productCategory);
          setSubCategory(productData.productSpecCategory);
          setProductImageUrl(productData.productImage);
        }
      }
      setLoading(false);
    };

    fetchCategoriesAndProduct();
  }, [productId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProductImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!productName || !productDescription || !productPrice || !category || !subCategory || (!productImage && !productImageUrl)) {
      setError('Please fill out all fields');
      return;
    }

    try {
      let imageUrl = productImageUrl;

      if (productImage) {
        const imageRef = ref(storage, `product_images/${productImage.name}`);
        await uploadBytes(imageRef, productImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productData = {
        productName,
        productDescription,
        productPrice,
        productCategory: category,
        productSpecCategory: subCategory,
        productImage: imageUrl,
        available: true,
        added_at: Date.now(),
      };

      if (productId) {
        await updateDoc(doc(db, 'products', productId), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      setOpen(true);
      setProductName('');
      setProductDescription('');
      setProductPrice(null);
      setCategory('');
      setSubCategory('');
      setProductImage(null);
      setProductImageUrl('');
    } catch (error) {
      setError('Failed to save product');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {productId ? 'Update Product' : 'Add Product'}
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
            {subCategories
              .filter(subCat => subCat.categoryId === category)
              .map(subCat => (
                <MenuItem key={subCat.id} value={subCat.id}>{subCat.name}</MenuItem>
              ))
            }
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
          {!productImage && productImageUrl && (
            <div className="image-preview">
              <img src={productImageUrl} alt="Preview" />
            </div>
          )}
        </div>
        <Button type="submit" variant="contained" color="primary">
          {productId ? 'Update Product' : 'Add Product'}
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </form>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>{productId ? 'Product updated successfully!' : 'Product added successfully!'}</Typography>
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

export default ProductForm;
