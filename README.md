# Modern Library Management System

A comprehensive web application for managing library operations including book management, member management, borrowing, reservations, reviews, and events. Features a sleek, modern UI with abstract animations and interactive elements.

## Features

- **User Authentication**
  - Registration and login for library members
  - Role-based access control (Members and Staff)

- **Book Management**
  - Browse and search for books by various criteria
  - View detailed book information
  - Check book availability and location

- **Member Operations**
  - Borrow and return books
  - Reserve books that are currently unavailable
  - View borrowing history and current status
  - Write and manage book reviews
  - Register for library events

- **Staff Operations**
  - Manage books (add, update, remove)
  - Manage members and their status
  - Track overdue books and fines
  - Create and manage library events
  - Generate reports

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT for authentication

### Frontend
- React.js
- React Router for navigation
- React Bootstrap for UI components
- Styled Components for modern styling
- Framer Motion for animations
- Canvas API for abstract background animations
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL (v8+)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/library-management-system.git
   cd library-management-system
   ```

2. Install dependencies
   ```
   npm run install-all
   ```

3. Configure environment variables
   - Create a `.env` file in the server directory using the provided `.env.example` template

4. Set up the database
   - Create a MySQL database named 'library_management'
   - Run the SQL scripts in the following order:
     - TABLES.sql (creates the database schema)
     - COMMANDS.sql (creates triggers, stored procedures, etc.)
     - INSERTIONS.sql (loads sample data)

5. Start the development server
   ```
   npm run dev
   ```

6. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Documentation

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new member
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books with optional filtering
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Add a new book (staff only)
- `PUT /api/books/:id` - Update a book (staff only)
- `DELETE /api/books/:id` - Delete a book (staff only)

### Borrowings
- `POST /api/borrowings` - Borrow a book
- `GET /api/borrowings/me` - Get user's borrowings
- `PUT /api/borrowings/:borrowId/return` - Return a book
- `GET /api/borrowings/overdue` - Get all overdue books (staff only)

### Reservations
- `POST /api/reservations` - Create a reservation
- `GET /api/reservations/me` - Get user's reservations
- `PUT /api/reservations/:reservationId/cancel` - Cancel a reservation
- `GET /api/reservations` - Get all reservations (staff only)

### Reviews
- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `POST /api/reviews` - Add a review
- `PUT /api/reviews/:reviewId` - Update a review
- `DELETE /api/reviews/:reviewId` - Delete a review
- `GET /api/reviews/me` - Get user's reviews

### Events
- `GET /api/events` - Get upcoming events
- `GET /api/events/:eventId` - Get event details
- `POST /api/events/:eventId/register` - Register for an event
- `DELETE /api/events/:eventId/register` - Cancel event registration
- `GET /api/events/me/registered` - Get user's registered events
- `POST /api/events` - Create an event (staff only)
- `PUT /api/events/:eventId` - Update an event (staff only)
- `DELETE /api/events/:eventId` - Delete an event (staff only)

### Members
- `GET /api/members/profile` - Get user profile
- `PUT /api/members/profile` - Update user profile
- `PUT /api/members/password` - Change password
- `GET /api/members` - Get all members (staff only)
- `GET /api/members/:memberId` - Get member details (staff only)
- `PUT /api/members/:memberId/status` - Update member status (staff only)

## License

This project is licensed under the MIT License - see the LICENSE file for details.