import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import AuthContext from '../../utils/AuthContext';

const Header = () => {
  const { isAuthenticated, isAdmin, currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="library" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaBook className="me-2" /> Library Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/books">Books</Nav.Link>
            <Nav.Link as={Link} to="/events">Events</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/admin/dashboard">Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/books">Manage Books</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/members">Manage Members</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/events">Manage Events</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/reports">Reports</NavDropdown.Item>
                  </NavDropdown>
                )}
                <NavDropdown title={`${currentUser?.firstName || 'User'}`} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/dashboard">
                    <FaUser className="me-2" /> Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/borrowing-history">Borrowing History</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button variant="outline-light" className="me-2" as={Link} to="/login">
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button variant="light" as={Link} to="/register">
                  <FaUserPlus className="me-1" /> Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;