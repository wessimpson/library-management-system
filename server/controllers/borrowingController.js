const { pool } = require('../config/db');

// Borrow a book
exports.borrowBook = async (req, res) => {
  const { bookId } = req.body;
  const memberId = req.member.MemberID;

  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if member can borrow more books
      const [currentBorrowings] = await connection.query(
        'SELECT COUNT(*) AS count FROM Borrowings WHERE MemberID = ? AND Status IN ("Active", "Overdue")',
        [memberId]
      );

      if (currentBorrowings[0].count >= 5) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Maximum borrowing limit reached (5 books)'
        });
      }

      // Check if member has any overdue books
      const [overdueBooks] = await connection.query(
        'SELECT COUNT(*) AS count FROM Borrowings WHERE MemberID = ? AND Status = "Overdue"',
        [memberId]
      );

      if (overdueBooks[0].count > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'You have overdue books. Please return them first'
        });
      }

      // Check if member has outstanding fines
      const [outstandingFines] = await connection.query(
        'SELECT SUM(FineAmount) AS total FROM Borrowings WHERE MemberID = ? AND FineAmount > 0',
        [memberId]
      );

      if (outstandingFines[0].total > 10.00) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'You have outstanding fines. Please pay them first'
        });
      }

      // Check if the book is available
      const [book] = await connection.query(
        'SELECT AvailableCopies, BranchID FROM Books WHERE BookID = ?',
        [bookId]
      );

      if (book.length === 0 || book[0].AvailableCopies <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Book is not available for borrowing'
        });
      }

      // Check if the book is reserved by someone else
      const [reservations] = await connection.query(
        'SELECT COUNT(*) AS count FROM Reservations WHERE BookID = ? AND Status = "Active" AND MemberID != ?',
        [bookId, memberId]
      );

      if (reservations[0].count > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Book is reserved by another member'
        });
      }

      // Calculate due date (14 days from today)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const formattedDueDate = dueDate.toISOString().split('T')[0];

      // Create borrowing record
      const [borrowResult] = await connection.query(
        'INSERT INTO Borrowings (MemberID, BookID, BorrowDate, DueDate, Status, FineAmount) VALUES (?, ?, CURDATE(), ?, "Active", 0.00)',
        [memberId, bookId, formattedDueDate]
      );

      // Update available copies
      await connection.query(
        'UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = ?',
        [bookId]
      );

      // Check if member had a reservation for this book and update it
      await connection.query(
        'UPDATE Reservations SET Status = "Fulfilled" WHERE BookID = ? AND MemberID = ? AND Status = "Active"',
        [bookId, memberId]
      );

      // Commit the transaction
      await connection.commit();
      connection.release();

      // Get the book details
      const [bookDetails] = await pool.query(
        `SELECT b.Title, b.ISBN, a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName
         FROM Books b
         JOIN Authors a ON b.AuthorID = a.AuthorID
         WHERE b.BookID = ?`,
        [bookId]
      );

      res.status(200).json({
        success: true,
        data: {
          borrowId: borrowResult.insertId,
          memberId,
          bookId,
          bookTitle: bookDetails[0].Title,
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: formattedDueDate,
          status: 'Active'
        }
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error borrowing book',
      error: error.message
    });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  const { borrowId } = req.params;
  const memberId = req.member.MemberID;

  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if borrowing exists and belongs to the member
      const [borrowing] = await connection.query(
        'SELECT b.*, bk.BookID, bk.BranchID FROM Borrowings b JOIN Books bk ON b.BookID = bk.BookID WHERE b.BorrowID = ? AND b.MemberID = ?',
        [borrowId, memberId]
      );

      if (borrowing.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'Borrowing record not found'
        });
      }

      if (borrowing[0].Status === 'Returned') {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Book has already been returned'
        });
      }

      // Calculate days overdue and fine amount if applicable
      const dueDate = new Date(borrowing[0].DueDate);
      const today = new Date();
      let daysOverdue = 0;
      let fineAmount = 0;

      if (today > dueDate) {
        daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 0.50;
      }

      // Update borrowing record
      await connection.query(
        'UPDATE Borrowings SET ReturnDate = CURDATE(), Status = "Returned", FineAmount = ? WHERE BorrowID = ?',
        [fineAmount, borrowId]
      );

      // Update book availability
      await connection.query(
        'UPDATE Books SET AvailableCopies = AvailableCopies + 1 WHERE BookID = ?',
        [borrowing[0].BookID]
      );

      // Check if book is reserved and update reservation status
      await connection.query(
        `UPDATE Reservations 
         SET Status = "Fulfilled" 
         WHERE BookID = ? AND Status = "Active" 
         ORDER BY ReservationDate 
         LIMIT 1`,
        [borrowing[0].BookID]
      );

      // Commit the transaction
      await connection.commit();
      connection.release();

      res.status(200).json({
        success: true,
        data: {
          borrowId,
          returnDate: today.toISOString().split('T')[0],
          daysOverdue,
          fineAmount
        }
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
};

// Get member's borrowing history
exports.getMemberBorrowings = async (req, res) => {
  const memberId = req.member.MemberID;
  const { status } = req.query;

  try {
    let query = `
      SELECT br.BorrowID, br.BookID, b.Title, b.ISBN, 
             a.FirstName AS AuthorFirstName, a.LastName AS AuthorLastName,
             br.BorrowDate, br.DueDate, br.ReturnDate, br.Status, br.FineAmount
      FROM Borrowings br
      JOIN Books b ON br.BookID = b.BookID
      JOIN Authors a ON b.AuthorID = a.AuthorID
      WHERE br.MemberID = ?
    `;
    const queryParams = [memberId];

    if (status) {
      query += ' AND br.Status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY br.BorrowDate DESC';

    const [borrowings] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings
    });
  } catch (error) {
    console.error('Get member borrowings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving borrowing history',
      error: error.message
    });
  }
};

// For staff: Get all overdue books
exports.getOverdueBooks = async (req, res) => {
  try {
    const [overdueBooks] = await pool.query(
      `SELECT br.BorrowID, b.BookID, b.Title, b.ISBN, 
              m.MemberID, m.FirstName, m.LastName, m.Email,
              br.BorrowDate, br.DueDate, 
              DATEDIFF(CURDATE(), br.DueDate) AS DaysOverdue,
              br.FineAmount
       FROM Borrowings br
       JOIN Books b ON br.BookID = b.BookID
       JOIN Members m ON br.MemberID = m.MemberID
       WHERE br.Status = 'Overdue'
       ORDER BY DaysOverdue DESC`
    );

    res.status(200).json({
      success: true,
      count: overdueBooks.length,
      data: overdueBooks
    });
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving overdue books',
      error: error.message
    });
  }
};