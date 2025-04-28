import axios from 'axios';
import logger from './logger';

// Books
export const getBooks = async (filters = {}) => {
  try {
    const res = await axios.get('/api/books', { params: filters });
    return res.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const getBook = async (id) => {
  try {
    const res = await axios.get(`/api/books/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

export const addBook = async (bookData) => {
  try {
    const res = await axios.post('/api/books', bookData);
    return res.data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const res = await axios.put(`/api/books/${id}`, bookData);
    return res.data;
  } catch (error) {
    console.error(`Error updating book with ID ${id}:`, error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const res = await axios.delete(`/api/books/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting book with ID ${id}:`, error);
    throw error;
  }
};

// Borrowings
export const borrowBook = async (bookId) => {
  try {
    const res = await axios.post('/api/borrowings', { bookId });
    return res.data;
  } catch (error) {
    console.error(`Error borrowing book with ID ${bookId}:`, error);
    throw error;
  }
};

export const returnBook = async (borrowId) => {
  try {
    const res = await axios.put(`/api/borrowings/${borrowId}/return`);
    return res.data;
  } catch (error) {
    console.error(`Error returning book with borrowing ID ${borrowId}:`, error);
    throw error;
  }
};

export const getMemberBorrowings = async (status) => {
  try {
    const res = await axios.get('/api/borrowings/me', { params: { status } });
    return res.data;
  } catch (error) {
    console.error('Error fetching member borrowings:', error);
    throw error;
  }
};

export const getOverdueBooks = async () => {
  try {
    const res = await axios.get('/api/borrowings/overdue');
    return res.data;
  } catch (error) {
    console.error('Error fetching overdue books:', error);
    throw error;
  }
};

// Reservations
export const createReservation = async (bookId) => {
  try {
    const res = await axios.post('/api/reservations', { bookId });
    return res.data;
  } catch (error) {
    console.error(`Error creating reservation for book with ID ${bookId}:`, error);
    throw error;
  }
};

export const cancelReservation = async (reservationId) => {
  try {
    const res = await axios.put(`/api/reservations/${reservationId}/cancel`);
    return res.data;
  } catch (error) {
    console.error(`Error canceling reservation with ID ${reservationId}:`, error);
    throw error;
  }
};

export const getMemberReservations = async (status) => {
  try {
    const res = await axios.get('/api/reservations/me', { params: { status } });
    return res.data;
  } catch (error) {
    console.error('Error fetching member reservations:', error);
    throw error;
  }
};

// Reviews
export const getBookReviews = async (bookId) => {
  try {
    const res = await axios.get(`/api/reviews/book/${bookId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching reviews for book with ID ${bookId}:`, error);
    throw error;
  }
};

export const addReview = async (reviewData) => {
  try {
    const res = await axios.post('/api/reviews', reviewData);
    return res.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const res = await axios.put(`/api/reviews/${reviewId}`, reviewData);
    return res.data;
  } catch (error) {
    console.error(`Error updating review with ID ${reviewId}:`, error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await axios.delete(`/api/reviews/${reviewId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting review with ID ${reviewId}:`, error);
    throw error;
  }
};

export const getMemberReviews = async () => {
  try {
    const res = await axios.get('/api/reviews/me');
    return res.data;
  } catch (error) {
    console.error('Error fetching member reviews:', error);
    throw error;
  }
};

// Events
export const getUpcomingEvents = async () => {
  try {
    const res = await axios.get('/api/events');
    return res.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const getEvent = async (eventId) => {
  try {
    const res = await axios.get(`/api/events/${eventId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

export const registerForEvent = async (eventId) => {
  try {
    const res = await axios.post(`/api/events/${eventId}/register`);
    return res.data;
  } catch (error) {
    console.error(`Error registering for event with ID ${eventId}:`, error);
    throw error;
  }
};

export const cancelEventRegistration = async (eventId) => {
  try {
    const res = await axios.delete(`/api/events/${eventId}/register`);
    return res.data;
  } catch (error) {
    console.error(`Error canceling registration for event with ID ${eventId}:`, error);
    throw error;
  }
};

export const getMemberEvents = async () => {
  try {
    const res = await axios.get('/api/events/me/registered');
    return res.data;
  } catch (error) {
    console.error('Error fetching member events:', error);
    throw error;
  }
};

// Members
export const getMemberProfile = async () => {
  try {
    const res = await axios.get('/api/members/profile');
    return res.data;
  } catch (error) {
    console.error('Error fetching member profile:', error);
    throw error;
  }
};

// Admin APIs
export const getMembers = async () => {
  try {
    const res = await axios.get('/api/members');
    return res.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const getMemberDetails = async (memberId) => {
  try {
    const res = await axios.get(`/api/members/${memberId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching member details with ID ${memberId}:`, error);
    throw error;
  }
};

export const updateMemberStatus = async (memberId, membershipStatus) => {
  try {
    const res = await axios.put(`/api/members/${memberId}/status`, { membershipStatus });
    return res.data;
  } catch (error) {
    console.error(`Error updating member status with ID ${memberId}:`, error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const res = await axios.post('/api/events', eventData);
    return res.data;
  } catch (error) {
    logger.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const res = await axios.put(`/api/events/${eventId}`, eventData);
    return res.data;
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const res = await axios.delete(`/api/events/${eventId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    throw error;
  }
};

// Additional APIs for admin/staff functionality
export const getAllReservations = async () => {
  try {
    const res = await axios.get('/api/reservations');
    return res.data;
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const res = await axios.get('/api/books/genres');
    return res.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getAuthors = async () => {
  try {
    const res = await axios.get('/api/books/authors');
    return res.data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

export const getPublishers = async () => {
  try {
    const res = await axios.get('/api/books/publishers');
    return res.data;
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
};