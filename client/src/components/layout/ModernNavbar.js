import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaBars, FaTimes, FaUser, FaBook, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from '../../utils/AuthContext';

// Styled components
const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: ${props => props.scrolled ? '0 10px 30px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const Logo = styled(motion.div)`
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.8rem;
  color: #1E5F74;
  text-decoration: none;
  display: flex;
  align-items: center;
  letter-spacing: -0.03em;
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  span {
    color: #F7567C;
  }
`;

const MenuToggle = styled.div`
  display: none;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 1002;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavItems = styled(motion.div)`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 250px;
    background: rgba(30, 95, 116, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    z-index: 1001;
    transform: ${({ isOpen }) => isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease-in-out;
  }
`;

const NavLink = styled(motion.div)`
  margin: 0 1rem;
  position: relative;
  
  a {
    color: #2D3B55;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.5rem 0;
    display: inline-block;
    transition: color 0.3s ease;
    
    &:hover {
      color: #F7567C;
    }
    
    @media (max-width: 768px) {
      color: white;
      font-size: 1.1rem;
      margin: 1rem 0;
    }
  }
  
  &.active a {
    color: #F7567C;
  }
`;

const Indicator = styled(motion.div)`
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: #F7567C;
  border-radius: 2px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthButton = styled(motion.button)`
  background: linear-gradient(135deg, #1E5F74 0%, #2D3B55 100%);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(30, 95, 116, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 95, 116, 0.3);
  }
  
  svg {
    margin-right: 0.5rem;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Navbar component
const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close menu when navigating
    setIsOpen(false);
  }, [location]);
  
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };
  
  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <NavbarContainer 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      scrolled={scrolled}
    >
      <Logo 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Link to="/">
          Libris<span>.</span>
        </Link>
      </Logo>
      
      <MenuToggle onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </MenuToggle>
      
      <NavItems isOpen={isOpen}>
        <NavLink
          variants={linkVariants}
          whileHover="hover"
          className={isActive('/') ? 'active' : ''}
        >
          <Link to="/">Home</Link>
          {isActive('/') && <Indicator layoutId="indicator" />}
        </NavLink>
        
        <NavLink
          variants={linkVariants}
          whileHover="hover"
          className={isActive('/books') ? 'active' : ''}
        >
          <Link to="/books">Books</Link>
          {isActive('/books') && <Indicator layoutId="indicator" />}
        </NavLink>
        
        <NavLink
          variants={linkVariants}
          whileHover="hover"
          className={isActive('/events') ? 'active' : ''}
        >
          <Link to="/events">Events</Link>
          {isActive('/events') && <Indicator layoutId="indicator" />}
        </NavLink>
        
        {isAuthenticated ? (
          <>
            <NavLink
              variants={linkVariants}
              whileHover="hover"
              className={isActive('/profile') ? 'active' : ''}
            >
              <Link to="/profile">Profile</Link>
              {isActive('/profile') && <Indicator layoutId="indicator" />}
            </NavLink>
            
            <AuthButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
            >
              <FaSignOutAlt /> Logout
            </AuthButton>
          </>
        ) : (
          <>
            <AuthButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              as={Link}
              to="/login"
            >
              <FaUser /> Login
            </AuthButton>
          </>
        )}
      </NavItems>
    </NavbarContainer>
  );
};

export default ModernNavbar;