import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FaStar, FaBookOpen } from 'react-icons/fa';

// Styled components
const Card = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 450px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  perspective: 1000px;
  transform-style: preserve-3d;
  background: white;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
`;

const CardContent = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
`;

const CoverImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%;
    background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
  }
`;

const BookDetails = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  padding: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const BookTitle = styled(motion.h3)`
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1E5F74;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  line-height: 1.3;
`;

const BookAuthor = styled(motion.p)`
  font-size: 0.85rem;
  color: #6C7A89;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const BookMetadata = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const Genre = styled(motion.span)`
  background-color: rgba(30, 95, 116, 0.1);
  color: #1E5F74;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.3em 0.8em;
  border-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Rating = styled(motion.div)`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  
  svg {
    color: #F9A602;
    margin-right: 0.25rem;
  }
  
  span {
    font-weight: 600;
  }
`;

const AvailabilityBadge = styled(motion.div)`
  position: absolute;
  top: 1rem;
  left: 0;
  background: ${props => props.isAvailable === 'true' ? 'rgba(52, 199, 89, 0.9)' : 'rgba(247, 86, 124, 0.9)'};
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.4em 1em;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 10px ${props => props.isAvailable === 'true' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(247, 86, 124, 0.3)'};
  backdrop-filter: blur(5px);
  z-index: 10;
`;

const AvailabilityInfo = styled(motion.div)`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  margin-top: auto;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.isAvailable === 'true' ? '#34c759' : '#F7567C'};
  }
  
  span {
    font-weight: 500;
    color: ${props => props.isAvailable === 'true' ? '#34c759' : '#F7567C'};
  }
  
  small {
    margin-left: 0.5rem;
    color: #6C7A89;
    font-size: 0.7rem;
  }
`;

// Main component
const ModernBookCard = ({ book }) => {
  const cardRef = useRef(null);
  
  // Default book cover image
  const defaultCover = 'https://via.placeholder.com/300x400?text=No+Cover';
  
  // Motion values for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;
    
    x.set(posX);
    y.set(posY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  // Spring animations for smoother movement
  const springConfig = { damping: 20, stiffness: 100 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
    >
      <Link to={`/books/${book.BookID}`} style={{ textDecoration: 'none' }}>
        <CardContent
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY
          }}
        >
          {book.AvailableCopies > 0 && (
            <AvailabilityBadge 
              isAvailable="true"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Available
            </AvailabilityBadge>
          )}
          
          {book.AvailableCopies === 0 && (
            <AvailabilityBadge 
              isAvailable="false"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Unavailable
            </AvailabilityBadge>
          )}
          
          <CoverImage image={book.coverImage || defaultCover} />
          
          <BookDetails>
            <BookTitle>{book.Title}</BookTitle>
            <BookAuthor>by {book.AuthorFirstName} {book.AuthorLastName}</BookAuthor>
            
            <BookMetadata>
              <Genre>{book.Genre}</Genre>
              
              {book.averageRating ? (
                <Rating>
                  <FaStar /> <span>{book.averageRating.toFixed(1)}</span>
                </Rating>
              ) : (
                <Rating>
                  <span style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '0.8rem' }}>No ratings</span>
                </Rating>
              )}
            </BookMetadata>
            
            <AvailabilityInfo isAvailable={(book.AvailableCopies > 0).toString()}>
              <FaBookOpen />
              <span>
                {book.AvailableCopies > 0 ? 'Available now' : 'Currently unavailable'}
              </span>
              <small>
                {book.AvailableCopies} of {book.TotalCopies}
              </small>
            </AvailabilityInfo>
          </BookDetails>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ModernBookCard;