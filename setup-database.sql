-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS library_management;

-- Use the database
USE library_management;

-- Create tables
-- Members table
CREATE TABLE IF NOT EXISTS Members (
    MemberID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    MembershipDate DATE NOT NULL,
    MembershipStatus ENUM('Active', 'Suspended', 'Expired') NOT NULL,
    MembershipType VARCHAR(50) NOT NULL,
    Password VARCHAR(255),
    CONSTRAINT unique_email UNIQUE (Email)
);

-- Authors table
CREATE TABLE IF NOT EXISTS Authors (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Biography TEXT,
    Nationality VARCHAR(50)
);

-- Publishers table
CREATE TABLE IF NOT EXISTS Publishers (
    PublisherID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255),
    ContactPerson VARCHAR(100),
    Phone VARCHAR(20),
    Email VARCHAR(100)
);

-- Genres table
CREATE TABLE IF NOT EXISTS Genres (
    GenreID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Description TEXT
);

-- LibraryBranches table
CREATE TABLE IF NOT EXISTS LibraryBranches (
    BranchID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    ManagerID INT,
    FOREIGN KEY (ManagerID) REFERENCES Members(MemberID)
);

-- Books table
CREATE TABLE IF NOT EXISTS Books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    ISBN VARCHAR(20) NOT NULL UNIQUE,
    Title VARCHAR(255) NOT NULL,
    AuthorID INT NOT NULL,
    PublisherID INT NOT NULL,
    GenreID INT NOT NULL,
    PublicationYear INT,
    Edition VARCHAR(50),
    TotalCopies INT NOT NULL,
    AvailableCopies INT NOT NULL,
    Location VARCHAR(50),
    BranchID INT NOT NULL,
    FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID),
    FOREIGN KEY (PublisherID) REFERENCES Publishers(PublisherID),
    FOREIGN KEY (GenreID) REFERENCES Genres(GenreID),
    FOREIGN KEY (BranchID) REFERENCES LibraryBranches(BranchID),
    CHECK (AvailableCopies <= TotalCopies)
);

-- Borrowings table
CREATE TABLE IF NOT EXISTS Borrowings (
    BorrowID INT AUTO_INCREMENT PRIMARY KEY,
    MemberID INT NOT NULL,
    BookID INT NOT NULL,
    BorrowDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    ReturnDate DATE,
    Status ENUM('Active', 'Returned', 'Overdue') NOT NULL,
    FineAmount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID),
    FOREIGN KEY (BookID) REFERENCES Books(BookID)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS Reservations (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    MemberID INT NOT NULL,
    BookID INT NOT NULL,
    ReservationDate DATETIME NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    Status ENUM('Active', 'Expired', 'Fulfilled') NOT NULL,
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID),
    FOREIGN KEY (BookID) REFERENCES Books(BookID)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    MemberID INT NOT NULL,
    BookID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    ReviewText TEXT,
    ReviewDate DATETIME NOT NULL,
    CONSTRAINT fk_review_member FOREIGN KEY (MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE,
    CONSTRAINT fk_review_book FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE
);

-- Events table
CREATE TABLE IF NOT EXISTS Events (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    EventName VARCHAR(100) NOT NULL,
    EventDescription TEXT,
    EventDate DATETIME NOT NULL,
    Location VARCHAR(255),
    OrganizerID INT,
    CONSTRAINT fk_event_organizer FOREIGN KEY (OrganizerID) REFERENCES Members(MemberID) ON DELETE SET NULL
);

-- Notifications table for the review trigger
CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    MemberID INT NOT NULL,
    Message TEXT NOT NULL,
    NotificationDate DATETIME NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE
);

-- Event attendees junction table for the event registration procedure
CREATE TABLE IF NOT EXISTS EventAttendees (
    AttendeeID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT NOT NULL,
    MemberID INT NOT NULL,
    RegistrationDate DATETIME NOT NULL,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE,
    UNIQUE KEY unique_event_member (EventID, MemberID)
);

-- Book ratings summary table for the review trigger
CREATE TABLE IF NOT EXISTS BookRatings (
    BookID INT PRIMARY KEY,
    TotalRating INT NOT NULL DEFAULT 0,
    NumberOfRatings INT NOT NULL DEFAULT 0,
    AverageRating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE
);

-- Create triggers, stored procedures, and functions

-- Trigger: Automatically update book status to 'Overdue' when due date passes
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_overdue_status
BEFORE UPDATE ON Borrowings
FOR EACH ROW
BEGIN
    IF (NEW.Status = 'Active' AND NEW.DueDate < CURDATE() AND OLD.Status = 'Active') THEN
        SET NEW.Status = 'Overdue';
        SET NEW.FineAmount = 0.50; -- Set initial fine amount
    END IF;
END//
DELIMITER ;

-- Stored procedure: Process for returning a book
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS return_book(
    IN p_borrow_id INT,
    IN p_member_id INT,
    IN p_book_id INT
)
BEGIN
    DECLARE v_branch_id INT;
    DECLARE v_days_overdue INT;
    DECLARE v_fine_amount DECIMAL(10, 2);
    
    -- Get the branch ID of the book
    SELECT BranchID INTO v_branch_id 
    FROM Books 
    WHERE BookID = p_book_id;
    
    -- Calculate days overdue and fine amount if applicable
    SELECT DATEDIFF(CURDATE(), DueDate) INTO v_days_overdue
    FROM Borrowings
    WHERE BorrowID = p_borrow_id;
    
    IF v_days_overdue > 0 THEN
        SET v_fine_amount = v_days_overdue * 0.50;
    ELSE
        SET v_fine_amount = 0.00;
    END IF;
    
    -- Update borrowing record
    UPDATE Borrowings
    SET ReturnDate = CURDATE(), 
        Status = 'Returned',
        FineAmount = v_fine_amount
    WHERE BorrowID = p_borrow_id AND MemberID = p_member_id;
    
    -- Update book availability
    UPDATE Books
    SET AvailableCopies = AvailableCopies + 1
    WHERE BookID = p_book_id AND BranchID = v_branch_id;
    
    -- Check if book is reserved and update reservation status if needed
    UPDATE Reservations
    SET Status = 'Fulfilled'
    WHERE BookID = p_book_id AND Status = 'Active'
    ORDER BY ReservationDate
    LIMIT 1;
END//
DELIMITER ;

-- Function: Check if a member can borrow a book
DELIMITER //
CREATE FUNCTION IF NOT EXISTS can_borrow_book(
    p_member_id INT,
    p_book_id INT
) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_can_borrow BOOLEAN DEFAULT TRUE;
    DECLARE v_current_borrowings INT;
    DECLARE v_has_overdue INT;
    DECLARE v_total_fines DECIMAL(10, 2);
    DECLARE v_available_copies INT;
    DECLARE v_is_reserved INT;
    
    -- Check number of current borrowings
    SELECT COUNT(*) INTO v_current_borrowings
    FROM Borrowings
    WHERE MemberID = p_member_id AND Status IN ('Active', 'Overdue');
    
    IF v_current_borrowings >= 5 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for overdue books
    SELECT COUNT(*) INTO v_has_overdue
    FROM Borrowings
    WHERE MemberID = p_member_id AND Status = 'Overdue';
    
    IF v_has_overdue > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check total fines
    SELECT IFNULL(SUM(FineAmount), 0) INTO v_total_fines
    FROM Borrowings
    WHERE MemberID = p_member_id;
    
    IF v_total_fines > 10.00 THEN
        RETURN FALSE;
    END IF;
    
    -- Check book availability
    SELECT AvailableCopies INTO v_available_copies
    FROM Books
    WHERE BookID = p_book_id;
    
    IF v_available_copies <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if book is reserved by someone else
    SELECT COUNT(*) INTO v_is_reserved
    FROM Reservations
    WHERE BookID = p_book_id AND Status = 'Active' AND MemberID != p_member_id;
    
    IF v_is_reserved > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END//
DELIMITER ;

-- Trigger: Send notification when a new review is added for a highly borrowed book
DELIMITER //
CREATE TRIGGER IF NOT EXISTS notify_popular_book_review
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    DECLARE borrow_count INT;
    DECLARE book_title VARCHAR(255);
    
    -- Get the book title
    SELECT Title INTO book_title
    FROM Books
    WHERE BookID = NEW.BookID;
    
    -- Count number of times this book has been borrowed
    SELECT COUNT(*) INTO borrow_count
    FROM Borrowings
    WHERE BookID = NEW.BookID;
    
    -- If the book has been borrowed more than 5 times, insert a notification record
    IF borrow_count > 5 THEN
        INSERT INTO Notifications (MemberID, Message, NotificationDate, IsRead)
        VALUES (NEW.MemberID, CONCAT('Your review of the popular book "', book_title, '" has been highlighted!'), NOW(), 0);
    END IF;
END//
DELIMITER ;

-- Stored procedure: Manage event registration with capacity limits
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS register_for_event(
    IN p_member_id INT,
    IN p_event_id INT,
    OUT p_registration_status VARCHAR(100)
)
BEGIN
    DECLARE v_event_exists INT;
    DECLARE v_current_registrations INT;
    DECLARE v_max_capacity INT DEFAULT 50;
    DECLARE v_already_registered INT;
    DECLARE v_event_name VARCHAR(100);
    
    -- Check if event exists
    SELECT COUNT(*), EventName INTO v_event_exists, v_event_name
    FROM Events
    WHERE EventID = p_event_id;
    
    IF v_event_exists = 0 THEN
        SET p_registration_status = 'Event does not exist';
    ELSE
        -- Check if member is already registered
        SELECT COUNT(*) INTO v_already_registered
        FROM EventAttendees
        WHERE EventID = p_event_id AND MemberID = p_member_id;
        
        IF v_already_registered > 0 THEN
            SET p_registration_status = 'Already registered for this event';
        ELSE
            -- Check current registration count
            SELECT COUNT(*) INTO v_current_registrations
            FROM EventAttendees
            WHERE EventID = p_event_id;
            
            IF v_current_registrations >= v_max_capacity THEN
                SET p_registration_status = 'Event has reached maximum capacity';
            ELSE
                -- Register the member for the event
                INSERT INTO EventAttendees (EventID, MemberID, RegistrationDate)
                VALUES (p_event_id, p_member_id, NOW());
                
                SET p_registration_status = CONCAT('Successfully registered for event: ', v_event_name);
            END IF;
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger: Update book rating summary when a review is added
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_book_rating_on_insert
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    UPDATE BookRatings
    SET TotalRating = TotalRating + NEW.Rating,
        NumberOfRatings = NumberOfRatings + 1,
        AverageRating = (TotalRating + NEW.Rating) / (NumberOfRatings + 1)
    WHERE BookID = NEW.BookID;
    
    -- If no record exists, create one
    IF ROW_COUNT() = 0 THEN
        INSERT INTO BookRatings (BookID, TotalRating, NumberOfRatings, AverageRating)
        VALUES (NEW.BookID, NEW.Rating, 1, NEW.Rating);
    END IF;
END//
DELIMITER ;

