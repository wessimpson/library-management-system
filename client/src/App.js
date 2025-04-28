import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// Modern components
import ModernNavbar from './components/layout/ModernNavbar';
import AbstractBackground from './components/animations/AbstractBackground';
import DebugMonitor from './components/DebugMonitor';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BorrowingHistory from './pages/BorrowingHistory';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageMembers from './pages/admin/ManageMembers';
import ManageEvents from './pages/admin/ManageEvents';
import Reports from './pages/admin/Reports';

// Context
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';

// Styled components
const MainContent = styled.main`
  min-height: 100vh;
  padding: 6rem 0 3rem;
  position: relative;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Abstract animated background */}
        <AbstractBackground />
        
        {/* Debug monitor for tracking requests */}
        <DebugMonitor />
        
        {/* Modern navbar with animations */}
        <ModernNavbar />
        
        <MainContent>
          <ContentContainer>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              {/* Protected member routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/borrowing-history" element={<BorrowingHistory />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/books" element={<ManageBooks />} />
                <Route path="/admin/members" element={<ManageMembers />} />
                <Route path="/admin/events" element={<ManageEvents />} />
                <Route path="/admin/reports" element={<Reports />} />
              </Route>
              
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ContentContainer>
        </MainContent>
      </Router>
    </AuthProvider>
  );
}

export default App;