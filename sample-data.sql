-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Administrators/Staff and Members
INSERT INTO Members (FirstName, LastName, Email, Phone, Address, MembershipDate, MembershipStatus, MembershipType, Password) VALUES
('Admin', 'User', 'admin@library.com', '555-111-0000', 'Library Main Office', '2023-01-01', 'Active', 'Staff', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
('John', 'Doe', 'john.doe@email.com', '555-111-2222', '123 Main St, Anytown', '2023-01-15', 'Active', 'Regular', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
('Jane', 'Smith', 'jane.smith@email.com', '555-222-3333', '456 Oak Ave, Sometown', '2023-02-01', 'Active', 'Premium', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
('Michael', 'Johnson', 'michael.j@email.com', '555-333-4444', '789 Pine St, Othertown', '2023-01-20', 'Active', 'Regular', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u'),
('Emily', 'Williams', 'emily.w@email.com', '555-444-5555', '321 Elm St, Sometown', '2023-02-15', 'Active', 'Student', '$2a$10$JK4Nh31Z8JVCnGTrUTP3YeQm3HpB3fGJqKbc7YCk4ZRBs7p3rZD.u');

-- Library Branches
INSERT INTO LibraryBranches (Name, Address, Phone, Email, ManagerID) VALUES 
('Main Branch', '123 Library Street, Downtown', '555-123-4567', 'main@library.com', 1),
('North Branch', '456 Reader Avenue, Northside', '555-234-5678', 'north@library.com', 1),
('East Branch', '789 Book Boulevard, Eastside', '555-345-6789', 'east@library.com', 1);

-- Genres
INSERT INTO Genres (Name, Description) VALUES
('Fiction', 'Literary works created from the imagination, not presented as fact'),
('Non-Fiction', 'Informative or factual prose based on real events, people, and information'),
('Science', 'Books about scientific disciplines and discoveries'),
('History', 'Books about past events and human civilization'),
('Biography', 'Accounts of a person\'s life written by someone else'),
('Mystery', 'Fiction dealing with the solution of a crime or the revealing of secrets'),
('Fantasy', 'Imaginative fiction featuring magic and supernatural elements'),
('Romance', 'Fiction focused on the romantic relationship between characters'),
('Science Fiction', 'Fiction based on scientific discoveries, environmental changes, future technology, etc.');

-- Authors
INSERT INTO Authors (FirstName, LastName, Biography, Nationality) VALUES
('Jane', 'Austen', 'English novelist known for works of romantic fiction', 'British'),
('George', 'Orwell', 'English novelist, essayist, and critic', 'British'),
('Ernest', 'Hemingway', 'American novelist, short-story writer, and journalist', 'American'),
('Agatha', 'Christie', 'British mystery writer', 'British'),
('J.K.', 'Rowling', 'British author best known for the Harry Potter series', 'British'),
('Gabriel', 'García Márquez', 'Colombian novelist, short-story writer, and journalist', 'Colombian'),
('Toni', 'Morrison', 'American novelist, essayist, and professor', 'American'),
('Haruki', 'Murakami', 'Japanese writer and translator', 'Japanese'),
('Stephen', 'King', 'American author of horror, supernatural fiction, and fantasy', 'American');

-- Publishers
INSERT INTO Publishers (Name, Address, ContactPerson, Phone, Email) VALUES
('Penguin Random House', '1745 Broadway, New York, NY 10019', 'John Editor', '212-782-9000', 'info@penguinrandomhouse.com'),
('HarperCollins', '195 Broadway, New York, NY 10007', 'Sarah Publisher', '212-207-7000', 'contact@harpercollins.com'),
('Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020', 'Michael Books', '212-698-7000', 'info@simonandschuster.com'),
('Macmillan Publishers', '120 Broadway, New York, NY 10271', 'Laura Editor', '646-307-5151', 'info@macmillan.com'),
('Oxford University Press', 'Great Clarendon Street, Oxford OX2 6DP, UK', 'James Academic', '+44-1865-353011', 'contact@oup.com');

-- Books
INSERT INTO Books (ISBN, Title, AuthorID, PublisherID, GenreID, PublicationYear, Edition, TotalCopies, AvailableCopies, Location, BranchID) VALUES
('9780141439518', 'Pride and Prejudice', 1, 1, 1, 1813, 'Penguin Classics', 5, 3, 'Fiction Section, Shelf A', 1),
('9780451524935', '1984', 2, 1, 1, 1949, 'Signet Classics', 4, 2, 'Fiction Section, Shelf B', 1),
('9780684801223', 'The Old Man and the Sea', 3, 3, 1, 1952, 'First Edition', 3, 3, 'Fiction Section, Shelf C', 1),
('9780062073488', 'Murder on the Orient Express', 4, 2, 6, 1934, 'Harper', 4, 4, 'Mystery Section, Shelf A', 2),
('9780590353427', 'Harry Potter and the Sorcerer\'s Stone', 5, 2, 7, 1997, 'First American Edition', 6, 3, 'Fantasy Section, Shelf A', 1),
('9780060883287', 'One Hundred Years of Solitude', 6, 2, 1, 1967, 'Harper Perennial', 3, 2, 'Fiction Section, Shelf D', 3),
('9781400033416', 'Beloved', 7, 1, 1, 1987, 'Vintage', 3, 3, 'Fiction Section, Shelf E', 2),
('9780307476463', 'Norwegian Wood', 8, 1, 1, 1987, 'Vintage International', 2, 1, 'Fiction Section, Shelf F', 3),
('9781501182099', 'The Shining', 9, 3, 1, 1977, 'Gallery Books', 4, 3, 'Horror Section, Shelf A', 2);

-- Events
INSERT INTO Events (EventName, EventDescription, EventDate, Location, OrganizerID) VALUES
('Summer Reading Kickoff', 'Join us for the launch of our summer reading program with activities, refreshments, and book giveaways.', '2023-06-15 14:00:00', 'Main Branch - Community Room', 1),
('Author Spotlight: Local Writers', 'Meet and greet with local authors who will discuss their works and creative processes.', '2023-07-10 18:30:00', 'North Branch - Meeting Hall', 1),
('Children\'s Story Time', 'Weekly story time for children aged 3-8 with engaging stories and activities.', '2023-05-20 10:00:00', 'East Branch - Children\'s Corner', 1);

-- Borrowings
INSERT INTO Borrowings (MemberID, BookID, BorrowDate, DueDate, ReturnDate, Status, FineAmount) VALUES
(2, 1, '2023-04-01', '2023-04-15', '2023-04-14', 'Returned', 0.00),
(3, 2, '2023-04-05', '2023-04-19', NULL, 'Active', 0.00),
(4, 5, '2023-04-10', '2023-04-24', NULL, 'Active', 0.00),
(2, 4, '2023-03-20', '2023-04-03', '2023-04-05', 'Returned', 1.00);

-- Reservations
INSERT INTO Reservations (MemberID, BookID, ReservationDate, ExpiryDate, Status) VALUES
(3, 5, '2023-04-15 10:30:00', '2023-04-30 23:59:59', 'Active'),
(4, 1, '2023-04-16 14:45:00', '2023-05-01 23:59:59', 'Active');

-- Reviews
INSERT INTO Reviews (MemberID, BookID, Rating, ReviewText, ReviewDate) VALUES
(2, 1, 5, 'One of the best classical romances. Austen\'s wit and social commentary are timeless.', '2023-04-15 15:30:00'),
(3, 5, 4, 'A magical start to a wonderful series. Great for all ages!', '2023-04-20 16:45:00'),
(4, 4, 5, 'Christie at her best. The puzzle is intricate and the solution is surprising yet logical.', '2023-04-10 09:15:00');

-- Populate BookRatings from Reviews
INSERT INTO BookRatings (BookID, TotalRating, NumberOfRatings, AverageRating)
SELECT BookID, SUM(Rating), COUNT(*), AVG(Rating)
FROM Reviews
GROUP BY BookID;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;