const { pool } = require('../config/db');

// Get all upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate, e.Location,
              e.OrganizerID, m.FirstName AS OrganizerFirstName, m.LastName AS OrganizerLastName
       FROM Events e
       LEFT JOIN Members m ON e.OrganizerID = m.MemberID
       WHERE e.EventDate > NOW()
       ORDER BY e.EventDate`
    );

    // For each event, get the current number of attendees
    const eventsWithAttendees = await Promise.all(events.map(async (event) => {
      const [attendees] = await pool.query(
        'SELECT COUNT(*) AS count FROM EventAttendees WHERE EventID = ?',
        [event.EventID]
      );
      
      return {
        ...event,
        attendeeCount: attendees[0].count
      };
    }));

    res.status(200).json({
      success: true,
      count: events.length,
      data: eventsWithAttendees
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving upcoming events',
      error: error.message
    });
  }
};

// Get events by branch location
exports.getEventsByBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    // Get the branch name
    const [branch] = await pool.query(
      'SELECT Name FROM LibraryBranches WHERE BranchID = ?',
      [branchId]
    );

    if (branch.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Get events at this branch
    const [events] = await pool.query(
      `SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate, e.Location,
              e.OrganizerID, m.FirstName AS OrganizerFirstName, m.LastName AS OrganizerLastName
       FROM Events e
       LEFT JOIN Members m ON e.OrganizerID = m.MemberID
       WHERE e.Location LIKE ? AND e.EventDate > NOW()
       ORDER BY e.EventDate`,
      [`%${branch[0].Name}%`]
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events by branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving events by branch',
      error: error.message
    });
  }
};

// Get event details by ID
exports.getEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const [event] = await pool.query(
      `SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate, e.Location,
              e.OrganizerID, m.FirstName AS OrganizerFirstName, m.LastName AS OrganizerLastName
       FROM Events e
       LEFT JOIN Members m ON e.OrganizerID = m.MemberID
       WHERE e.EventID = ?`,
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get attendee count
    const [attendees] = await pool.query(
      'SELECT COUNT(*) AS count FROM EventAttendees WHERE EventID = ?',
      [eventId]
    );

    // Check if the requesting member is already registered
    let isRegistered = false;
    if (req.member) {
      const [registration] = await pool.query(
        'SELECT * FROM EventAttendees WHERE EventID = ? AND MemberID = ?',
        [eventId, req.member.MemberID]
      );
      isRegistered = registration.length > 0;
    }

    res.status(200).json({
      success: true,
      data: {
        ...event[0],
        attendeeCount: attendees[0].count,
        isRegistered
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving event details',
      error: error.message
    });
  }
};

// Register for an event
exports.registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const memberId = req.member.MemberID;

  try {
    // Check if the event exists
    const [event] = await pool.query(
      'SELECT * FROM Events WHERE EventID = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if the event is in the future
    if (new Date(event[0].EventDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a past event'
      });
    }

    // Check if the member is already registered
    const [registration] = await pool.query(
      'SELECT * FROM EventAttendees WHERE EventID = ? AND MemberID = ?',
      [eventId, memberId]
    );

    if (registration.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if the event is at capacity (max 50 attendees)
    const [attendees] = await pool.query(
      'SELECT COUNT(*) AS count FROM EventAttendees WHERE EventID = ?',
      [eventId]
    );

    if (attendees[0].count >= 50) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum capacity'
      });
    }

    // Register the member
    await pool.query(
      'INSERT INTO EventAttendees (EventID, MemberID, RegistrationDate) VALUES (?, ?, NOW())',
      [eventId, memberId]
    );

    res.status(200).json({
      success: true,
      data: {
        eventId,
        eventName: event[0].EventName,
        registrationDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
};

// Cancel event registration
exports.cancelEventRegistration = async (req, res) => {
  const { eventId } = req.params;
  const memberId = req.member.MemberID;

  try {
    // Check if the registration exists
    const [registration] = await pool.query(
      'SELECT * FROM EventAttendees WHERE EventID = ? AND MemberID = ?',
      [eventId, memberId]
    );

    if (registration.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Check if the event is in the future
    const [event] = await pool.query(
      'SELECT * FROM Events WHERE EventID = ?',
      [eventId]
    );

    if (new Date(event[0].EventDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for a past event'
      });
    }

    // Cancel the registration
    await pool.query(
      'DELETE FROM EventAttendees WHERE EventID = ? AND MemberID = ?',
      [eventId, memberId]
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Cancel event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling event registration',
      error: error.message
    });
  }
};

// Get member's registered events
exports.getMemberEvents = async (req, res) => {
  const memberId = req.member.MemberID;

  try {
    const [events] = await pool.query(
      `SELECT e.EventID, e.EventName, e.EventDescription, e.EventDate, e.Location,
              ea.RegistrationDate
       FROM EventAttendees ea
       JOIN Events e ON ea.EventID = e.EventID
       WHERE ea.MemberID = ?
       ORDER BY e.EventDate`,
      [memberId]
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get member events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving registered events',
      error: error.message
    });
  }
};

// For staff: Create a new event
exports.createEvent = async (req, res) => {
  const {
    eventName,
    eventDescription,
    eventDate,
    location,
    organizerId
  } = req.body;

  try {
    // Create the event
    const [result] = await pool.query(
      `INSERT INTO Events (EventName, EventDescription, EventDate, Location, OrganizerID)
       VALUES (?, ?, ?, ?, ?)`,
      [eventName, eventDescription, eventDate, location, organizerId]
    );

    res.status(201).json({
      success: true,
      data: {
        eventId: result.insertId,
        eventName,
        eventDescription,
        eventDate,
        location,
        organizerId
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// For staff: Update an event
exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    eventName,
    eventDescription,
    eventDate,
    location,
    organizerId
  } = req.body;

  try {
    // Check if the event exists
    const [event] = await pool.query(
      'SELECT * FROM Events WHERE EventID = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update the event
    await pool.query(
      `UPDATE Events
       SET EventName = ?, EventDescription = ?, EventDate = ?, Location = ?, OrganizerID = ?
       WHERE EventID = ?`,
      [eventName, eventDescription, eventDate, location, organizerId, eventId]
    );

    res.status(200).json({
      success: true,
      data: {
        eventId,
        eventName,
        eventDescription,
        eventDate,
        location,
        organizerId
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// For staff: Delete an event
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check if the event exists
    const [event] = await pool.query(
      'SELECT * FROM Events WHERE EventID = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete the event (cascade will delete attendees)
    await pool.query(
      'DELETE FROM Events WHERE EventID = ?',
      [eventId]
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};