# ✨ Modern Library Management System 📚

> *Where books meet beautiful design!* A modern take on library management with sleek animations and an immersive reading experience.

![Library Management System](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Overview

Welcome to our beautiful library management system! This isn't your grandmother's dusty card catalog—we've reimagined the library experience with abstract animations, smooth transitions, and an interface that makes browsing books a joy.

Designed for both readers and librarians, this application helps manage book collections, member profiles, borrowing operations, and library events in a visually stunning environment.

## ✨ Features

- 🎨 **Beautiful Modern Interface**
  - Abstract animated background that responds to user movement
  - Sleek 3D card effects for book browsing
  - Smooth transitions between pages
  - Elegant color palette with modern typography

- 🔐 **Smart User Management**
  - Seamless sign-up and login experiences
  - Role-based access with fluid animations
  - Interactive user profiles with borrowing stats

- 📚 **Delightful Book Experience**
  - Stunning book cards with tilt effects and depth
  - Immersive book detail pages
  - Smart filtering with animated transitions
  - Intuitive rating and review system

- 📱 **Responsive Everywhere**
  - Beautiful experience on any device
  - Touch-optimized interactions
  - Fluid animations that adapt to screen size

- 📊 **Admin Superpowers**
  - Elegant dashboards with live data
  - Visual book management interface
  - Member insights at a glance
  - Event scheduling with drag and drop

## 🛠️ Tech Magic

### ✨ Frontend Wonders
- React.js for component magic
- Styled Components for beautiful styling
- Framer Motion for delightful animations
- Three.js for 3D bookshelf visualization
- React Bootstrap enhanced with custom aesthetics

### 🧠 Backend Powers
- Node.js with Express for API elegance
- MySQL database with optimized queries
- JWT for secure authentication

## 🚀 Quick Start

For the quickest setup, use our automated script:

```bash
# Clone the repository
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system

# Make the quickstart script executable
chmod +x quickstart.sh

# Run the script (handles dependencies, database setup, and environment configuration)
./quickstart.sh
```

The script will:
- Install dependencies for both client and server
- Set up necessary environment variables
- Create the database and load schema from `setup-database.sql`
- Populate the database with sample data from `sample-data.sql`

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md).

## 🔑 Default Login Credentials

### Administrator Account
- Email: `admin@library.com`
- Password: `password123`

### Sample Member Account
- Email: `john.doe@email.com`
- Password: `password123`

## 📚 System Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v5.7 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 📸 Screenshots

*Coming soon!*

## 🌟 Key Features

### 📚 For Readers
- Discover books through an immersive interface
- Track personal reading journey
- Reserve books with one click
- Join library events with easy registration
- Share thoughts through the review system

### 👩‍💼 For Librarians
- Manage collection with visual tools
- Track borrowing patterns with insightful dashboards
- Organize events with drag-and-drop scheduling
- Manage members with intuitive interfaces
- Generate beautiful reports

## 📄 API Highlights

Our API is RESTful and elegant:

- `/api/books` - Discover the collection
- `/api/auth` - Seamless authentication
- `/api/borrowings` - Manage book circulation
- `/api/events` - Organize community gatherings
- `/api/members` - Member management
- `/api/reviews` - Share reading experiences

## 🔍 Project Structure

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
│   ├── models/           # Database models (MySQL)
│   ├── routes/           # API routes
│   └── index.js          # Entry point
├── quickstart.sh         # Automated setup script
├── setup-database.sql    # Database schema
├── sample-data.sql       # Sample data for testing
├── QUICKSTART.md         # Detailed setup instructions
└── README.md             # Project documentation
```

## ⚠️ Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify your MySQL server is running
   - Check that the database connection details in `.env` are correct
   - Use host `127.0.0.1` instead of `localhost` if you encounter connection issues
   - Ensure the `library_management` database exists

2. **Server Won't Start**
   - Check for errors in the console
   - Verify that port 5000 is available
   - Make sure all dependencies are installed

3. **Client Won't Start**
   - Check for errors in the console
   - Verify that port 3000 is available
   - Make sure all dependencies are installed

4. **Authentication Problems**
   - Clear your browser's localStorage
   - Ensure you're using the correct credentials
   - Check that your JWT_SECRET is set in the .env file
   - Verify JWT_EXPIRE is properly set (default is 30d)
   
5. **Logging Issues**
   - Ensure the server's /log endpoint is working
   - Check client-side logger implementation


## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
