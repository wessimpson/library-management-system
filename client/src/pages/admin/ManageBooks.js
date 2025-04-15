import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { getBooks, getGenres, getAuthors, getPublishers, addBook, updateBook, deleteBook } from '../../utils/api';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    authorId: '',
    publisherId: '',
    genreId: '',
    publicationYear: '',
    edition: '',
    totalCopies: 1,
    availableCopies: 1,
    location: '',
    branchId: 1
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          booksResponse,
          genresResponse,
          authorsResponse,
          publishersResponse
        ] = await Promise.all([
          getBooks(),
          getGenres(),
          getAuthors(),
          getPublishers()
        ]);
        
        setBooks(booksResponse.data);
        setGenres(genresResponse.data);
        setAuthors(authorsResponse.data);
        setPublishers(publishersResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter books based on search term
  const filteredBooks = books.filter(book => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      book.Title.toLowerCase().includes(searchLower) ||
      book.ISBN.toLowerCase().includes(searchLower) ||
      `${book.AuthorFirstName} ${book.AuthorLastName}`.toLowerCase().includes(searchLower) ||
      book.Genre.toLowerCase().includes(searchLower)
    );
  });
  
  const resetForm = () => {
    setFormData({
      isbn: '',
      title: '',
      authorId: '',
      publisherId: '',
      genreId: '',
      publicationYear: '',
      edition: '',
      totalCopies: 1,
      availableCopies: 1,
      location: '',
      branchId: 1
    });
    setFormErrors({});
    setEditingBook(null);
  };
  
  const handleOpenModal = (book = null) => {
    resetForm();
    
    if (book) {
      setEditingBook(book);
      setFormData({
        isbn: book.ISBN,
        title: book.Title,
        authorId: book.AuthorID,
        publisherId: book.PublisherID,
        genreId: book.GenreID,
        publicationYear: book.PublicationYear || '',
        edition: book.Edition || '',
        totalCopies: book.TotalCopies,
        availableCopies: book.AvailableCopies,
        location: book.Location || '',
        branchId: book.BranchID
      });
    }
    
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.authorId) errors.authorId = 'Author is required';
    if (!formData.publisherId) errors.publisherId = 'Publisher is required';
    if (!formData.genreId) errors.genreId = 'Genre is required';
    if (formData.totalCopies < 0) errors.totalCopies = 'Total copies cannot be negative';
    if (formData.availableCopies < 0) errors.availableCopies = 'Available copies cannot be negative';
    if (formData.availableCopies > formData.totalCopies) {
      errors.availableCopies = 'Available copies cannot exceed total copies';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Number conversions
      const bookData = {
        ...formData,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : null,
        totalCopies: parseInt(formData.totalCopies),
        availableCopies: parseInt(formData.availableCopies),
        authorId: parseInt(formData.authorId),
        publisherId: parseInt(formData.publisherId),
        genreId: parseInt(formData.genreId),
        branchId: parseInt(formData.branchId)
      };
      
      if (editingBook) {
        // Update existing book
        await updateBook(editingBook.BookID, bookData);
        setActionSuccess('Book updated successfully!');
      } else {
        // Add new book
        await addBook(bookData);
        setActionSuccess('Book added successfully!');
      }
      
      // Refresh book list
      const booksResponse = await getBooks();
      setBooks(booksResponse.data);
      
      handleCloseModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error saving book:', error);
      setError(error.response?.data?.message || 'Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteBook(bookId);
      
      // Remove book from state
      setBooks(books.filter(book => book.BookID !== bookId));
      
      setActionSuccess('Book deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error.response?.data?.message || 'Failed to delete book. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && books.length === 0) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error && books.length === 0) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Books</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> Add New Book
        </Button>
      </div>
      
      {actionSuccess && (
        <Alert variant="success" className="mb-4">
          {actionSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="mb-4">
        <Form.Group>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Form.Group>
      </div>
      
      {filteredBooks.length === 0 ? (
        <Alert variant="info">
          No books found. {searchTerm ? 'Try a different search term.' : 'Add your first book!'}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Genre</th>
                <th>Copies (Available/Total)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.BookID}>
                  <td>{book.Title}</td>
                  <td>{book.AuthorFirstName} {book.AuthorLastName}</td>
                  <td>{book.ISBN}</td>
                  <td>{book.Genre}</td>
                  <td>
                    {book.AvailableCopies} / {book.TotalCopies}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(book)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteBook(book.BookID)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      {/* Add/Edit Book Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingBook ? 'Edit Book' : 'Add New Book'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    isInvalid={!!formErrors.isbn}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.isbn}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Select
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleChange}
                    isInvalid={!!formErrors.authorId}
                  >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                      <option key={author.AuthorID} value={author.AuthorID}>
                        {author.FirstName} {author.LastName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.authorId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Select
                    name="publisherId"
                    value={formData.publisherId}
                    onChange={handleChange}
                    isInvalid={!!formErrors.publisherId}
                  >
                    <option value="">Select Publisher</option>
                    {publishers.map(publisher => (
                      <option key={publisher.PublisherID} value={publisher.PublisherID}>
                        {publisher.Name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.publisherId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select
                    name="genreId"
                    value={formData.genreId}
                    onChange={handleChange}
                    isInvalid={!!formErrors.genreId}
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre.GenreID} value={genre.GenreID}>
                        {genre.Name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.genreId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publication Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="publicationYear"
                    value={formData.publicationYear}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Edition</Form.Label>
                  <Form.Control
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Copies</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="totalCopies"
                    value={formData.totalCopies}
                    onChange={handleChange}
                    isInvalid={!!formErrors.totalCopies}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.totalCopies}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Available Copies</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="availableCopies"
                    value={formData.availableCopies}
                    onChange={handleChange}
                    isInvalid={!!formErrors.availableCopies}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.availableCopies}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Location in Library</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Fiction Section, Shelf A2"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Library Branch</Form.Label>
              <Form.Control
                type="number"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                min="1"
              />
              <Form.Text className="text-muted">
                Use ID: 1 for Main Branch, 2 for Downtown, 3 for Eastside, 4 for Westside, 5 for Northside
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageBooks;