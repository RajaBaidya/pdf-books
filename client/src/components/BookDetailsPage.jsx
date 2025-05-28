import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/bookDetails.css';

const BookDetailsPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/books/${id}`);
        setBook(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      window.open(`/api/books/${id}/download`, '_blank');
      setTimeout(() => setDownloading(false), 1500);
    } catch (error) {
      console.error('Error downloading book:', error);
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} />
        <div className="book-details-loading">
          <div className="loader"></div>
          <p>Loading book details...</p>
        </div>
      </>
    );
  }

  if (error || !book) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} />
        <div className="book-details-error">
          <h2>Error Loading Book</h2>
          <p>{error || 'Book not found'}</p>
          <button onClick={() => navigate('/books')} className="back-button">
            Back to Books
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="book-details-container">
        <div className="book-details-navigation">
          <Link to="/books" className="back-link">
            <i className="back-icon"></i> Back to Books
          </Link>
        </div>

        <div className="book-details-content">
          <div className="book-cover-container">
            <img 
              src={book.coverImage} 
              alt={`${book.title} cover`} 
              className="book-details-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23212936"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23fff" text-anchor="middle" dominant-baseline="middle">No Cover</text></svg>';
              }}
            />
          </div>

          <div className="book-details-info">
            <h1 className="book-details-title">{book.title}</h1>
            <div className="book-author">By {book.author}</div>
            
            <div className="book-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Category:</span>
                <span className="category-badge">{book.category}</span>
              </div>
              {book.publishedYear && (
                <div className="metadata-item">
                  <span className="metadata-label">Published:</span>
                  <span>{book.publishedYear}</span>
                </div>
              )}
              <div className="metadata-item">
                <span className="metadata-label">Added:</span>
                <span>{formatDate(book.createdAt)}</span>
              </div>
            </div>

            <div className="book-description">
              <h2>Description</h2>
              <p>{book.description}</p>
            </div>

            <div className="book-details-actions">
              <button 
                className={`download-button ${downloading ? 'downloading' : ''}`}
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Downloading...' : 'Download PDF'}
                <i className="download-icon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetailsPage; 