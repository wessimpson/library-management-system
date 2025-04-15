const { pool } = require('../config/db');

// Get all books with optional filtering
exports.getBooks = async (req, res) => {
  try {
    const { title, author, genre, branch, available } = req.query;
    let query = `
      SELECT b.BookID, b.ISBN, b.Title, 
             a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName,
             g.Name AS Genre, p.Name AS Publisher,
             b.PublicationYear, b.Edition, b.TotalCopies, b.AvailableCopies,
             lb.Name AS BranchName
      FROM Books b
      JOIN Authors a ON b.AuthorID = a.AuthorID
      JOIN Genres g ON b.GenreID = g.GenreID
      JOIN Publishers p ON b.PublisherID = p.PublisherID
      JOIN LibraryBranches lb ON b.BranchID = lb.BranchID
      WHERE 1=1
    `;
    const queryParams = [];

    // Add filters if provided
    if (title) {
      query += ` AND b.Title LIKE ?`;
      queryParams.push(`%${title}%`);
    }

    if (author) {
      query += ` AND (a.FirstName LIKE ? OR a.LastName LIKE ?)`;
      queryParams.push(`%${author}%`, `%${author}%`);
    }

    if (genre) {
      query += ` AND g.Name LIKE ?`;
      queryParams.push(`%${genre}%`);
    }

    if (branch) {
      query += ` AND lb.BranchID = ?`;
      queryParams.push(branch);
    }

    if (available === 'true') {
      query += ` AND b.AvailableCopies > 0`;
    }

    query += ` ORDER BY b.Title`;

    const [books] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving books',
      error: error.message
    });
  }
};

// Get a single book by ID
exports.getBook = async (req, res) => {
  try {
    const [book] = await pool.query(
      `SELECT b.BookID, b.ISBN, b.Title, 
              a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName, a.Biography AS AuthorBio,
              p.Name AS Publisher, g.Name AS Genre, g.Description AS GenreDescription,
              b.PublicationYear, b.Edition, b.TotalCopies, b.AvailableCopies, b.Location,
              lb.Name AS BranchName, lb.Address AS BranchAddress
       FROM Books b
       JOIN Authors a ON b.AuthorID = a.AuthorID
       JOIN Publishers p ON b.PublisherID = p.PublisherID
       JOIN Genres g ON b.GenreID = g.GenreID
       JOIN LibraryBranches lb ON b.BranchID = lb.BranchID
       WHERE b.BookID = ?`,
      [req.params.id]
    );

    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get book ratings
    const [ratings] = await pool.query(
      `SELECT AVG(Rating) AS AverageRating, COUNT(*) AS NumberOfReviews
       FROM Reviews
       WHERE BookID = ?`,
      [req.params.id]
    );

    // Get related books (same author or genre)
    const [relatedBooks] = await pool.query(
      `SELECT b.BookID, b.Title, b.ISBN, a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName,
              b.PublicationYear, b.AvailableCopies
       FROM Books b
       JOIN Authors a ON b.AuthorID = a.AuthorID
       WHERE (b.AuthorID = ? OR b.GenreID = ?) AND b.BookID != ?
       LIMIT 5`,
      [book[0].AuthorID, book[0].GenreID, req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...book[0],
        averageRating: ratings[0].AverageRating || 0,
        numberOfReviews: ratings[0].NumberOfReviews || 0,
        relatedBooks
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving book',
      error: error.message
    });
  }
};

// Add a new book (admin/staff only)
exports.addBook = async (req, res) => {
  try {
    const {
      isbn, title, authorId, publisherId, genreId, publicationYear,
      edition, totalCopies, availableCopies, location, branchId
    } = req.body;

    // Insert the book
    const [result] = await pool.query(
      `INSERT INTO Books (ISBN, Title, AuthorID, PublisherID, GenreID, PublicationYear, 
                         Edition, TotalCopies, AvailableCopies, Location, BranchID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isbn, title, authorId, publisherId, genreId, publicationYear,
       edition, totalCopies, availableCopies, location, branchId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        isbn,
        title,
        authorId,
        publisherId,
        genreId,
        publicationYear,
        edition,
        totalCopies,
        availableCopies,
        location,
        branchId
      }
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
};

// Update a book (admin/staff only)
exports.updateBook = async (req, res) => {
  try {
    const {
      isbn, title, authorId, publisherId, genreId, publicationYear,
      edition, totalCopies, availableCopies, location, branchId
    } = req.body;

    // Check if book exists
    const [existingBook] = await pool.query(
      'SELECT * FROM Books WHERE BookID = ?',
      [req.params.id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update the book
    await pool.query(
      `UPDATE Books 
       SET ISBN = ?, Title = ?, AuthorID = ?, PublisherID = ?, GenreID = ?, PublicationYear = ?,
           Edition = ?, TotalCopies = ?, AvailableCopies = ?, Location = ?, BranchID = ?
       WHERE BookID = ?`,
      [isbn, title, authorId, publisherId, genreId, publicationYear,
       edition, totalCopies, availableCopies, location, branchId, req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(req.params.id),
        isbn,
        title,
        authorId,
        publisherId,
        genreId,
        publicationYear,
        edition,
        totalCopies,
        availableCopies,
        location,
        branchId
      }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete a book (admin/staff only)
exports.deleteBook = async (req, res) => {
  try {
    // Check if book exists
    const [existingBook] = await pool.query(
      'SELECT * FROM Books WHERE BookID = ?',
      [req.params.id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active borrowings
    const [activeBorrowings] = await pool.query(
      'SELECT COUNT(*) AS count FROM Borrowings WHERE BookID = ? AND Status IN ("Active", "Overdue")',
      [req.params.id]
    );

    if (activeBorrowings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrowings'
      });
    }

    // Delete the book
    await pool.query('DELETE FROM Books WHERE BookID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

// Get all genres
exports.getGenres = async (req, res) => {
  try {
    const [genres] = await pool.query('SELECT * FROM Genres');

    res.status(200).json({
      success: true,
      count: genres.length,
      data: genres
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving genres',
      error: error.message
    });
  }
};

// Get all authors
exports.getAuthors = async (req, res) => {
  try {
    const [authors] = await pool.query('SELECT * FROM Authors');

    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors
    });
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving authors',
      error: error.message
    });
  }
};

// Get all publishers
exports.getPublishers = async (req, res) => {
  try {
    const [publishers] = await pool.query('SELECT * FROM Publishers');

    res.status(200).json({
      success: true,
      count: publishers.length,
      data: publishers
    });
  } catch (error) {
    console.error('Get publishers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving publishers',
      error: error.message
    });
  }
};