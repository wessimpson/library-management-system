# Library Management System - Quick Start Guide

This guide will help you get the Library Management System up and running quickly on any machine.

## Automated Setup (Recommended)

We've provided an automated setup script that will handle all the steps below for you:

```bash
# Make sure the script is executable
chmod +x quickstart.sh

# Run the script
./quickstart.sh
```

The script will:
1. Check for required dependencies (Node.js, npm, MySQL)
2. Install all dependencies for both server and client
3. Configure environment variables
4. Set up the MySQL database with schema and sample data
5. Provide instructions to start the application

## Manual Setup Instructions

If you prefer to set up manually, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

### 2. Install Dependencies

Install all dependencies for both the server and client:

```bash
# Install server dependencies
npm install

# Install client dependencies (note the --legacy-peer-deps flag)
cd client
npm install --legacy-peer-deps
cd ..
```

> **Note:** The `--legacy-peer-deps` flag is required for the client dependencies due to compatibility issues between some React packages. This is automatically handled by the quickstart script.

### 3. Set Up the Database

1. Create a MySQL database named `library_management`

2. Create a `.env` file in the `/server` directory with the following configuration:

```
DB_HOST=127.0.0.1
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=library_management
JWT_SECRET=generate_a_random_string_here
JWT_EXPIRE=30d
PORT=5000
```

3. Run the setup script to create tables and add sample data:

```bash
# Log in to MySQL
mysql -u your_mysql_username -p your_database_name < setup-database.sql
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

## Troubleshooting

### Database Connection Issues
- Verify your MySQL server is running
- Try using '127.0.0.1' instead of 'localhost' for the DB_HOST
- Ensure the MySQL user has permissions to access the database
- Check that the database connection details in `.env` are correct
- Ensure the `library_management` database exists

### Server Won't Start
- Check for errors in the console
- Verify that the required ports (5000 for server, 3000 for client) are available
- Make sure all dependencies are installed
- Ensure the `.env` file is correctly configured with JWT_SECRET and JWT_EXPIRE

### Client Won't Start
- Check for errors in the console
- Verify that Node.js and npm are properly installed
- Make sure you used the `--legacy-peer-deps` flag when installing client dependencies

## System Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v5.7 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Need More Help?

Refer to the complete documentation in the README.md file or open an issue on GitHub for more detailed information.