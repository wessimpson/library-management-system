# Library Management System - Quick Start Guide

This guide will help you get the Library Management System up and running quickly.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

### 2. Install Dependencies

Install all dependencies for both the server and client:

```bash
npm run install-all
```

Or install them separately:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Set Up the Database

1. Create a MySQL database named `library_management`

2. Update the database configuration in `/server/.env`:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=library_management
```

3. Run the setup script to create tables and add sample data:

```bash
# Log in to MySQL
mysql -u your_mysql_username -p

# Once logged in
source setup-database.sql
```

### 4. Start the Application

Start both the server and client concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Start the server
npm run server

# In another terminal, start the client
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

### Administrator Account
- Email: admin@library.com
- Password: password123

### Sample Member Account
- Email: john.doe@email.com
- Password: password123

## Basic Usage

### As a Member
1. Register a new account or use the sample member account
2. Browse books in the catalog
3. Borrow available books
4. Reserve books that are not available
5. Return borrowed books
6. Review books you've read
7. Register for library events

### As an Administrator
1. Log in with the admin account
2. Manage books (add, update, delete)
3. Manage members (view details, update status)
4. Track overdue books
5. Create and manage events
6. View various reports

## Project Structure

```
library-management-system/
├── client/               # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── utils/        # Utility functions
│       └── App.js        # Main application component
├── server/               # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── index.js          # Entry point
├── setup-database.sql    # Database setup script
├── package.json          # Project metadata
└── README.md             # Project documentation
```

## Development Workflow

1. Make changes to the codebase
2. Test your changes locally
3. Commit your changes
4. Push to your repository

## Troubleshooting

### Database Connection Issues
- Verify your MySQL server is running
- Check that the database connection details in `.env` are correct
- Ensure the `library_management` database exists

### Server Won't Start
- Check for errors in the console
- Verify that the required ports (5000 for server, 3000 for client) are available
- Make sure all dependencies are installed

### Client Won't Start
- Check for errors in the console
- Verify that Node.js and npm are properly installed
- Make sure all dependencies are installed

## Need More Help?

Refer to the complete documentation in the README.md file for more detailed information.