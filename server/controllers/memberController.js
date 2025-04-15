const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Get member profile
exports.getMemberProfile = async (req, res) => {
  const memberId = req.member.MemberID;

  try {
    const [member] = await pool.query(
      `SELECT MemberID, FirstName, LastName, Email, Phone, Address, 
              MembershipDate, MembershipStatus, MembershipType
       FROM Members
       WHERE MemberID = ?`,
      [memberId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get active borrowings count
    const [borrowings] = await pool.query(
      'SELECT COUNT(*) AS count FROM Borrowings WHERE MemberID = ? AND Status IN ("Active", "Overdue")',
      [memberId]
    );

    // Get total fines
    const [fines] = await pool.query(
      'SELECT SUM(FineAmount) AS total FROM Borrowings WHERE MemberID = ?',
      [memberId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...member[0],
        activeBorrowings: borrowings[0].count,
        totalFines: fines[0].total || 0
      }
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving member profile',
      error: error.message
    });
  }
};

// Update member profile
exports.updateMemberProfile = async (req, res) => {
  const memberId = req.member.MemberID;
  const { firstName, lastName, phone, address } = req.body;

  try {
    await pool.query(
      `UPDATE Members
       SET FirstName = ?, LastName = ?, Phone = ?, Address = ?
       WHERE MemberID = ?`,
      [firstName, lastName, phone, address, memberId]
    );

    res.status(200).json({
      success: true,
      data: {
        id: memberId,
        firstName,
        lastName,
        phone,
        address
      }
    });
  } catch (error) {
    console.error('Update member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const memberId = req.member.MemberID;
  const { currentPassword, newPassword } = req.body;

  try {
    // Get current password hash
    const [member] = await pool.query(
      'SELECT Password FROM Members WHERE MemberID = ?',
      [memberId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, member[0].Password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE Members SET Password = ? WHERE MemberID = ?',
      [hashedPassword, memberId]
    );

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// For staff: Get all members
exports.getMembers = async (req, res) => {
  try {
    const [members] = await pool.query(
      `SELECT MemberID, FirstName, LastName, Email, Phone, 
              MembershipDate, MembershipStatus, MembershipType
       FROM Members
       ORDER BY LastName, FirstName`
    );

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving members',
      error: error.message
    });
  }
};

// For staff: Get member details
exports.getMemberDetails = async (req, res) => {
  const { memberId } = req.params;

  try {
    const [member] = await pool.query(
      `SELECT MemberID, FirstName, LastName, Email, Phone, Address,
              MembershipDate, MembershipStatus, MembershipType
       FROM Members
       WHERE MemberID = ?`,
      [memberId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get active borrowings
    const [activeBorrowings] = await pool.query(
      `SELECT br.BorrowID, br.BookID, b.Title, br.BorrowDate, br.DueDate, br.Status, br.FineAmount
       FROM Borrowings br
       JOIN Books b ON br.BookID = b.BookID
       WHERE br.MemberID = ? AND br.Status IN ('Active', 'Overdue')
       ORDER BY br.DueDate`,
      [memberId]
    );

    // Get borrowing history
    const [borrowingHistory] = await pool.query(
      `SELECT br.BorrowID, br.BookID, b.Title, br.BorrowDate, br.ReturnDate, br.Status, br.FineAmount
       FROM Borrowings br
       JOIN Books b ON br.BookID = b.BookID
       WHERE br.MemberID = ? AND br.Status = 'Returned'
       ORDER BY br.BorrowDate DESC
       LIMIT 10`,
      [memberId]
    );

    // Get total fines
    const [fines] = await pool.query(
      'SELECT SUM(FineAmount) AS total FROM Borrowings WHERE MemberID = ?',
      [memberId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...member[0],
        activeBorrowings,
        borrowingHistory,
        totalFines: fines[0].total || 0
      }
    });
  } catch (error) {
    console.error('Get member details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving member details',
      error: error.message
    });
  }
};

// For staff: Update member status
exports.updateMemberStatus = async (req, res) => {
  const { memberId } = req.params;
  const { membershipStatus } = req.body;

  try {
    // Check if member exists
    const [member] = await pool.query(
      'SELECT * FROM Members WHERE MemberID = ?',
      [memberId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if status is valid
    if (!['Active', 'Suspended', 'Expired'].includes(membershipStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership status'
      });
    }

    // Update member status
    await pool.query(
      'UPDATE Members SET MembershipStatus = ? WHERE MemberID = ?',
      [membershipStatus, memberId]
    );

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(memberId),
        membershipStatus
      }
    });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member status',
      error: error.message
    });
  }
};