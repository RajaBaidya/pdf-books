import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/adminBooks.css';

const AdminBooksPage = ({ user, onLogout }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentBook, setCurrentBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    publishedYear: '',
    isActive: true
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get('/api/books/admin/all', config);
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('Error fetching admin books:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      publishedYear: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setModalType('edit');
    setCurrentBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      publishedYear: book.publishedYear || '',
      isActive: book.isActive
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (modalType === 'add') {
        // In a real implementation, you would handle file uploads here
        await axios.post('/api/books', formData, config);
      } else if (modalType === 'edit' && currentBook) {
        await axios.put(`/api/books/${currentBook._id}`, formData, config);
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      console.error('Error saving book:', err);
      // In a real implementation, you would show an error message
    }
  };

  const toggleBookStatus = async (book) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`/api/books/${book._id}`, 
        { isActive: !book.isActive }, 
        config
      );

      fetchBooks();
    } catch (err) {
      console.error('Error toggling book status:', err);
    }
  };

  const handleDeleteConfirmation = (book) => {
    setConfirmDelete(book);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const confirmDeleteBook = async () => {
    if (!confirmDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`/api/books/${confirmDelete._id}`, config);
      setConfirmDelete(null);
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  // Get unique categories for filtering
  const categories = ['all', ...new Set(books.map(book => book.category))];
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter books by selected category
  const filteredBooks = selectedCategory === 'all' 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="admin-books-container">
        <div className="admin-books-header">
          <h1>Manage Books</h1>
          <p>Add, edit, or remove books from the library</p>
        </div>
        
        <div className="admin-books-actions">
          <div className="admin-filter">
            <span>Filter by:</span>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button className="add-book-button" onClick={openAddModal}>
            <i className="add-icon"></i>
            Add New Book
          </button>
        </div>
        
        {loading ? (
          <div className="admin-books-loading">
            <div className="admin-loader"></div>
            <p>Loading books...</p>
          </div>
        ) : error ? (
          <div className="admin-books-error">
            <p>{error}</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="admin-books-empty">
            <p>No books available in this category.</p>
          </div>
        ) : (
          <div className="admin-books-table-container">
            <table className="admin-books-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book._id} className={!book.isActive ? 'inactive-book' : ''}>
                    <td>
                      <div className="book-thumbnail">
                        <img 
                          src={book.coverImage} 
                          alt={`${book.title} cover`}
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23212936"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23fff" text-anchor="middle" dominant-baseline="middle">No Cover</text></svg>';
                          }}
                        />
                      </div>
                    </td>
                    <td className="book-title-cell">{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <span className="category-badge">{book.category}</span>
                    </td>
                    <td>{book.publishedYear || 'N/A'}</td>
                    <td>
                      <div className="toggle-container">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={book.isActive} 
                            onChange={() => toggleBookStatus(book)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className={`status-text ${book.isActive ? 'active' : 'inactive'}`}>
                          {book.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(book)}
                          aria-label={`Edit ${book.title}`}
                        >
                          <i className="edit-icon"></i>
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteConfirmation(book)}
                          aria-label={`Delete ${book.title}`}
                        >
                          <i className="delete-icon"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
              <button 
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="book-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="publishedYear">Published Year</label>
                <input
                  type="number"
                  id="publishedYear"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleInputChange}
                  placeholder="(Optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                ></textarea>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              {modalType === 'add' && (
                <div className="form-group file-upload-group">
                  <label htmlFor="coverImage">Cover Image</label>
                  <div className="file-upload">
                    <span>Upload Cover Image</span>
                    <input
                      type="file"
                      id="coverImage"
                      name="coverImage"
                      accept="image/*"
                      disabled
                    />
                  </div>
                  <p className="file-info">Currently disabled in demo mode</p>
                </div>
              )}
              {modalType === 'add' && (
                <div className="form-group file-upload-group">
                  <label htmlFor="bookFile">Book File (PDF)</label>
                  <div className="file-upload">
                    <span>Upload PDF</span>
                    <input
                      type="file"
                      id="bookFile"
                      name="bookFile"
                      accept="application/pdf"
                      disabled
                    />
                  </div>
                  <p className="file-info">Currently disabled in demo mode</p>
                </div>
              )}
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {modalType === 'add' ? 'Add Book' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h2>Confirm Deletion</h2>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to delete <strong>{confirmDelete.title}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="cancel-delete-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={confirmDeleteBook}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBooksPage; 