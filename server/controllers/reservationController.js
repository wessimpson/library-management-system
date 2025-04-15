const { pool } = require('../config/db');

// Create a reservation
exports.createReservation = async (req, res) => {
  const { bookId } = req.body;
  const memberId = req.member.MemberID;

  try {
    // Check if the book exists
    const [book] = await pool.query(
      'SELECT * FROM Books WHERE BookID = ?',
      [bookId]
    );

    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if the book is already available
    if (book[0].AvailableCopies > 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is currently available for borrowing, no need to reserve'
      });
    }

    // Check if the member already has an active reservation for this book
    const [existingReservation] = await pool.query(
      'SELECT * FROM Reservations WHERE BookID = ? AND MemberID = ? AND Status = "Active"',
      [bookId, memberId]
    );

    if (existingReservation.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active reservation for this book'
      });
    }

    // Calculate expiry date (2 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 2);
    const formattedExpiryDate = expiryDate.toISOString().split('T')[0] + ' ' + expiryDate.toTimeString().split(' ')[0];

    // Create the reservation
    const [result] = await pool.query(
      'INSERT INTO Reservations (MemberID, BookID, ReservationDate, ExpiryDate, Status) VALUES (?, ?, NOW(), ?, "Active")',
      [memberId, bookId, formattedExpiryDate]
    );

    // Get book details
    const [bookDetails] = await pool.query(
      `SELECT b.Title, a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName
       FROM Books b
       JOIN Authors a ON b.AuthorID = a.AuthorID
       WHERE b.BookID = ?`,
      [bookId]
    );

    res.status(201).json({
      success: true,
      data: {
        reservationId: result.insertId,
        bookId,
        bookTitle: bookDetails[0].Title,
        author: `${bookDetails[0].AuthorFirstName} ${bookDetails[0].AuthorLastName}`,
        reservationDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: 'Active'
      }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
};

// Cancel a reservation
exports.cancelReservation = async (req, res) => {
  const { reservationId } = req.params;
  const memberId = req.member.MemberID;

  try {
    // Check if the reservation exists and belongs to the member
    const [reservation] = await pool.query(
      'SELECT * FROM Reservations WHERE ReservationID = ? AND MemberID = ?',
      [reservationId, memberId]
    );

    if (reservation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if the reservation is active
    if (reservation[0].Status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Reservation cannot be canceled, current status is ${reservation[0].Status}`
      });
    }

    // Cancel the reservation
    await pool.query(
      'UPDATE Reservations SET Status = "Expired" WHERE ReservationID = ?',
      [reservationId]
    );

    res.status(200).json({
      success: true,
      data: {
        reservationId,
        status: 'Expired'
      }
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling reservation',
      error: error.message
    });
  }
};

// Get member's reservations
exports.getMemberReservations = async (req, res) => {
  const memberId = req.member.MemberID;
  const { status } = req.query;

  try {
    let query = `
      SELECT r.ReservationID, r.BookID, b.Title, 
             a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName,
             r.ReservationDate, r.ExpiryDate, r.Status
      FROM Reservations r
      JOIN Books b ON r.BookID = b.BookID
      JOIN Authors a ON b.AuthorID = a.AuthorID
      WHERE r.MemberID = ?
    `;
    const queryParams = [memberId];

    if (status) {
      query += ' AND r.Status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY r.ReservationDate DESC';

    const [reservations] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Get member reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reservations',
      error: error.message
    });
  }
};

// For staff: Get all active reservations
exports.getAllReservations = async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT r.ReservationID, r.BookID, b.Title, 
              m.MemberID, m.FirstName, m.LastName, m.Email,
              r.ReservationDate, r.ExpiryDate, r.Status
       FROM Reservations r
       JOIN Books b ON r.BookID = b.BookID
       JOIN Members m ON r.MemberID = m.MemberID
       WHERE r.Status = 'Active'
       ORDER BY r.ReservationDate`
    );

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reservations',
      error: error.message
    });
  }
};