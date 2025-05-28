import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/books.css';

const BooksPage = ({ user, onLogout }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/books');
        setBooks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Get unique categories from books
  const categories = ['all', ...new Set(books.map(book => book.category))];

  // Filter books by selected category
  const filteredBooks = selectedCategory === 'all' 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  const handleDownload = async (id) => {
    try {
      window.open(`/api/books/${id}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading book:', error);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="books-container">
        <div className="books-header">
          <h1>Library Books</h1>
          <p>Browse and download available books</p>
        </div>

        <div className="books-filter">
          <div className="filter-label">Filter by category:</div>
          <div className="category-selector">
            {categories.map(category => (
              <button 
                key={category} 
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="books-loading">
            <div className="loader"></div>
            <p>Loading books...</p>
          </div>
        ) : error ? (
          <div className="books-error">
            <p>{error}</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="books-empty">
            <p>No books available in this category.</p>
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.map(book => (
              <div className="book-card" key={book._id}>
                <Link to={`/books/${book._id}`} className="book-cover-link">
                  <div className="book-cover">
                    <img 
                      src={book.coverImage} 
                      alt={`${book.title} cover`} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23212936"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23fff" text-anchor="middle" dominant-baseline="middle">No Cover</text></svg>';
                      }}
                    />
                  </div>
                </Link>
                <div className="book-info">
                  <Link to={`/books/${book._id}`} className="book-title-link">
                    <h3 className="book-title">{book.title}</h3>
                  </Link>
                  <p className="book-author">By {book.author}</p>
                  <p className="book-category">{book.category}</p>
                  {book.publishedYear && <p className="book-year">{book.publishedYear}</p>}
                </div>
                <div className="book-description">
                  <p>{book.description.length > 100 
                    ? `${book.description.substring(0, 100)}...` 
                    : book.description}
                  </p>
                </div>
                <div className="book-actions">
                  <Link to={`/books/${book._id}`} className="details-btn">
                    View Details
                  </Link>
                  <button 
                    className="download-btn"
                    onClick={() => handleDownload(book._id)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BooksPage; 