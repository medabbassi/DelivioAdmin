import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SStyle.css';

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productName: string;
  productCategory: string;
  productSpecCategory: string;
  productImage: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const productCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productCollection);
        const productList: Product[] = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const categoryCollection = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoryCollection);
        const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));

        const subCategoryCollection = collection(db, 'subcategories');
        const subCategorySnapshot = await getDocs(subCategoryCollection);
        const subCategoryList: SubCategory[] = subCategorySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setProducts(productList);
        setCategories(categoryList);
        setSubCategories(subCategoryList);
        setFilteredProducts(productList);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        searchTerm === '' || product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getSubCategoryName = (subCategoryId: string) => {
    const subCategory = subCategories.find(subCat => subCat.id === subCategoryId);
    return subCategory ? subCategory.name : 'Unknown';
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(product => product.id !== productId));
      setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const handleUpdate = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Product List
      </Typography>
      <div className="search-export-container">
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="name">
            <input
              type="text"
              placeholder="Search here..."
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
        <Button variant="contained" className="export-button">
          <i className="icon-file-text"></i>Export all products
        </Button>
        <div className="add-buttons">
          <Button
            variant="contained"
            color="primary"
            className="add-button"
            onClick={() => navigate('/categories/new')}
          >
            + Add Category
          </Button>
          <Button
            variant="contained"
            color="primary"
            className="add-button"
            onClick={() => navigate('/subcategories/new')}
          >
            + Add SubCategory
          </Button>
          <Button
            variant="contained"
            color="primary"
            className="add-button"
            onClick={() => navigate('/products/new')}
          >
            + Add Product
          </Button>
        </div>
      </div>
      <div className="table-container">
        <ul className="table-title">
          <li>Product Image</li>
          <li>Name</li>
          <li>Category</li>
          <li>SubCategory</li>
          <li>Action</li>
        </ul>
        {filteredProducts.map((product, index) => (
          <ul key={product.id} className={`product-item ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
            <li>
              <img src={product.productImage} alt={product.productName} className="product-image" />
            </li>
            <li>{product.productName}</li>
            <li>{getCategoryName(product.productCategory)}</li>
            <li>{getSubCategoryName(product.productSpecCategory)}</li>
            <li>
              <IconButton className="action-button" onClick={() => navigate(`/products/${product.id}`)}>
                <Visibility />
              </IconButton>
              <IconButton className="action-button" onClick={() => handleUpdate(product.id)}>
                <Edit />
              </IconButton>
              <IconButton className="action-button delete-button" onClick={() => handleDelete(product.id)}>
                <Delete />
              </IconButton>
            </li>
          </ul>
        ))}
      </div>
      <div className="pagination-container">
        <IconButton className="pagination-button">&lt;</IconButton>
        <IconButton className="pagination-button active">1</IconButton>
        <IconButton className="pagination-button">2</IconButton>
        <IconButton className="pagination-button">3</IconButton>
        <IconButton className="pagination-button">&gt;</IconButton>
      </div>
    </Container>
  );
};

export default ProductList;
