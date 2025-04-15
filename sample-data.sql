-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Check if Password column exists and add it if it doesn't
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'library_management' AND TABLE_NAME = 'Members' AND COLUMN_NAME = 'Password';

SET @alterStmt = IF(@columnExists = 0, 'ALTER TABLE Members ADD COLUMN Password VARCHAR(255)', 'SELECT 1');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Delete existing data
DELETE FROM EventAttendees;
DELETE FROM Notifications;
DELETE FROM BookRatings;
DELETE FROM Reviews;
DELETE FROM Reservations;
DELETE FROM Borrowings;
DELETE FROM Events;
DELETE FROM Books;
DELETE FROM LibraryBranches;
DELETE FROM Members;
DELETE FROM Authors;
DELETE FROM Publishers;
DELETE FROM Genres;

-- Insert sample data for Members table with Password
INSERT INTO Members (MemberID, FirstName, LastName, Email, Phone, Address, MembershipDate, MembershipStatus, MembershipType, Password) VALUES
(1, 'John', 'Doe', 'john@example.com', '555-123-4567', '123 Main St, Anytown', '2024-01-15', 'Active', 'Standard', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
(2, 'Jane', 'Smith', 'jane@example.com', '555-234-5678', '456 Oak Ave, Sometown', '2024-02-20', 'Active', 'Premium', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
(3, 'Admin', 'User', 'admin@example.com', '555-999-0000', 'Library Office', '2023-01-01', 'Active', 'Staff', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u');

-- Insert sample data for Authors table
INSERT INTO Authors (AuthorID, FirstName, LastName, Biography, Nationality) VALUES
(1, 'J.K.', 'Rowling', 'British author best known for the Harry Potter series', 'British'),
(2, 'Stephen', 'King', 'American author of horror, supernatural fiction, and fantasy', 'American'),
(3, 'Agatha', 'Christie', 'British writer known for detective novels', 'British');

-- Insert sample data for Publishers table
INSERT INTO Publishers (PublisherID, Name, Address, ContactPerson, Phone, Email) VALUES
(1, 'Bloomsbury', 'London, UK', 'Contact Person 1', '123-456-7890', 'contact@bloomsbury.com'),
(2, 'HarperCollins', 'New York, USA', 'Contact Person 2', '234-567-8901', 'contact@harpercollins.com'),
(3, 'Scribner', 'New York, USA', 'Contact Person 3', '345-678-9012', 'contact@scribner.com');

-- Insert sample data for Genres table
INSERT INTO Genres (GenreID, Name, Description) VALUES
(1, 'Fantasy', 'Fiction with magical or supernatural elements'),
(2, 'Mystery', 'Fiction dealing with the solution of a crime or puzzle'),
(3, 'Science Fiction', 'Fiction based on scientific discoveries or advanced technology'),
(4, 'Romance', 'Fiction focused on romantic relationships'),
(5, 'Thriller', 'Fiction characterized by suspense and excitement');

-- Insert sample data for LibraryBranches table
INSERT INTO LibraryBranches (BranchID, Name, Address, Phone, Email, ManagerID) VALUES
(1, 'Main Branch', '100 Library Ave, Anytown', '555-100-1000', 'main@library.com', 3),
(2, 'Downtown Branch', '200 Center St, Anytown', '555-200-2000', 'downtown@library.com', 3);

-- Insert sample data for Books table
INSERT INTO Books (BookID, ISBN, Title, AuthorID, PublisherID, GenreID, PublicationYear, Edition, TotalCopies, AvailableCopies, Location, BranchID) VALUES
(1, '9780747532743', 'Harry Potter and the Philosopher''s Stone', 1, 1, 1, 1997, '1st Edition', 5, 3, 'Fiction Section', 1),
(2, '9780747538486', 'Harry Potter and the Chamber of Secrets', 1, 1, 1, 1998, '1st Edition', 5, 4, 'Fiction Section', 1),
(3, '9780747542155', 'Harry Potter and the Prisoner of Azkaban', 1, 1, 1, 1999, '1st Edition', 5, 5, 'Fiction Section', 1),
(4, '9781501175466', 'The Shining', 2, 3, 5, 1977, 'Reprint', 3, 2, 'Fiction Section', 2),
(5, '9780062073488', 'Murder on the Orient Express', 3, 2, 2, 1934, 'Reprint', 4, 3, 'Mystery Section', 2);

-- Insert sample data for Borrowings table
INSERT INTO Borrowings (BorrowID, MemberID, BookID, BorrowDate, DueDate, ReturnDate, Status, FineAmount) VALUES
(1, 1, 1, '2025-01-10', '2025-01-24', '2025-01-22', 'Returned', 0.00),
(2, 2, 3, '2025-01-15', '2025-01-29', NULL, 'Active', 0.00);

-- Insert sample data for Events table
INSERT INTO Events (EventID, EventName, EventDescription, EventDate, Location, OrganizerID) VALUES
(1, 'Summer Reading Kickoff', 'Join us for the launch of our summer reading program with games, prizes, and refreshments!', '2025-06-01 13:00:00', 'Main Branch - Community Room', 3),
(2, 'Author Meet & Greet: Local Writers', 'Meet local authors and discuss their work in this informal gathering.', '2025-04-15 18:30:00', 'Downtown Branch - Reading Area', 3);

-- Add some event attendees
INSERT INTO EventAttendees (AttendeeID, EventID, MemberID, RegistrationDate) VALUES
(1, 1, 1, '2025-02-15 10:30:00'),
(2, 1, 2, '2025-02-16 14:45:00'),
(3, 2, 1, '2025-03-01 09:15:00');

-- Add some book reviews
INSERT INTO Reviews (ReviewID, MemberID, BookID, Rating, ReviewText, ReviewDate) VALUES
(1, 1, 1, 5, 'Amazing book! The world-building is incredible.', '2025-01-24 17:30:00'),
(2, 2, 1, 4, 'Great story, but a bit slow at times.', '2025-01-29 08:45:00');

-- Add some book reservations
INSERT INTO Reservations (ReservationID, MemberID, BookID, ReservationDate, ExpiryDate, Status) VALUES
(1, 1, 4, '2025-02-01 10:00:00', '2025-02-03 10:00:00', 'Active'),
(2, 2, 5, '2025-02-02 14:30:00', '2025-02-04 14:30:00', 'Active');

-- Add some book ratings
INSERT INTO BookRatings (BookID, TotalRating, NumberOfRatings, AverageRating) VALUES
(1, 9, 2, 4.5);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;