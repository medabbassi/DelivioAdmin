import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, IconButton } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SStyle.css';

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  categoryImage: string;
  subCategories: SubCategory[];
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryCollection = collection(db, 'category');
        const categorySnapshot = await getDocs(categoryCollection);
        const categoryList: Category[] = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoryList);
        setFilteredCategories(categoryList);
      } catch (error) {
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(
      categories.filter(category =>
        searchTerm === '' || category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, categories]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Category List
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
          <i className="icon-file-text"></i>Export all categories
        </Button>
      </div>
      <div className="table-container">
        <ul className="table-title">
          <li>Category Image</li>
          <li>Name</li>
          <li>Subcategories</li>
          <li>Action</li>
        </ul>
        {filteredCategories.map((category, index) => (
          <ul key={category.id} className={`category-item ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
            <li>
              <img src={category.categoryImage} alt={category.name} className="category-image" />
            </li>
            <li>{category.name}</li>
            <li>{category.subCategories.map(sub => sub.name).join(', ')}</li>
            <li>
              <IconButton className="action-button" onClick={() => navigate(`/categories/${category.id}`)}>
                <Visibility />
              </IconButton>
              <IconButton className="action-button">
                <Edit />
              </IconButton>
              <IconButton className="action-button delete-button">
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

export default CategoryList;
