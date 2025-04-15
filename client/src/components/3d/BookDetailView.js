import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { gsap } from 'gsap';

const BookDetailView = ({ book, onClose }) => {
  const { camera } = useThree();
  const groupRef = useRef();
  const pagesRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Dimensions for the open book
  const bookWidth = 3;
  const bookHeight = 4;
  const bookDepth = 0.2;
  
  // Number of pages to display
  const numPages = 5;
  
  // Initialize animations when component mounts
  useEffect(() => {
    if (groupRef.current) {
      // Initial position off-screen
      groupRef.current.position.set(0, 0, -10);
      
      // Animate book into view
      gsap.to(groupRef.current.position, {
        z: 0,
        duration: 1.5,
        ease: "power3.out",
        onComplete: () => {
          setIsOpen(true);
        }
      });
      
      // Move camera to focus on the book
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }
    
    // Cleanup animation when component unmounts
    return () => {
      gsap.killTweensOf(groupRef.current?.position);
      gsap.killTweensOf(camera.position);
    };
  }, [camera]);
  
  // Open book animation
  useEffect(() => {
    if (isOpen && pagesRef.current) {
      // Animate pages opening
      gsap.to(pagesRef.current.rotation, {
        y: Math.PI / 2,
        duration: 1.2,
        ease: "back.out(1.7)"
      });
    }
  }, [isOpen]);
  
  // Handle close button click
  const handleClose = () => {
    // Close book animation
    if (pagesRef.current) {
      gsap.to(pagesRef.current.rotation, {
        y: 0,
        duration: 0.8,
        ease: "power2.in"
      });
    }
    
    // Move book away
    gsap.to(groupRef.current.position, {
      z: -10,
      duration: 1,
      ease: "power2.in",
      delay: 0.5,
      onComplete: () => {
        if (onClose) onClose();
      }
    });
  };
  
  // Create spring animation for page hover
  const [hoveredPage, setHoveredPage] = useState(null);
  
  // Book cover color based on genre
  const getBookCoverColor = () => {
    const genreColors = {
      'Fiction': '#6b4226',
      'Non-Fiction': '#2d3b55',
      'Science': '#1E5F74',
      'History': '#8B4513',
      'Biography': '#4A6741',
      'Mystery': '#800020',
      'Fantasy': '#702963',
      'Romance': '#F7567C',
      'Science Fiction': '#3457D5'
    };
    
    return book.Genre && genreColors[book.Genre] 
      ? genreColors[book.Genre] 
      : '#1E5F74'; // Default color
  };
  
  const coverColor = getBookCoverColor();
  
  // Calculate book content for different pages
  const getPageContent = (pageNum) => {
    switch(pageNum) {
      case 0:
        return (
          <Html transform position={[0, 0, 0.01]} className="book-page-content" style={{ width: '500px' }}>
            <div style={{ padding: '20px', color: '#333', fontFamily: 'Georgia, serif' }}>
              <h2 style={{ color: '#1E5F74', marginBottom: '1rem' }}>{book.Title || 'Book Title'}</h2>
              <p style={{ fontStyle: 'italic' }}>
                by {book.AuthorFirstName} {book.AuthorLastName}
              </p>
              <div style={{ marginTop: '1rem' }}>
                <p>{book.Description || 'No description available for this book.'}</p>
              </div>
            </div>
          </Html>
        );
      case 1:
        return (
          <Html transform position={[0, 0, 0.01]} className="book-page-content" style={{ width: '500px' }}>
            <div style={{ padding: '20px', color: '#333', fontFamily: 'Georgia, serif' }}>
              <h3 style={{ color: '#1E5F74', marginBottom: '1rem' }}>Details</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Genre</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>{book.Genre || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>ISBN</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>{book.ISBN || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Publisher</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>{book.Publisher || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Publication Year</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>{book.PublicationYear || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Edition</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>{book.Edition || 'First Edition'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Html>
        );
      case 2:
        return (
          <Html transform position={[0, 0, 0.01]} className="book-page-content" style={{ width: '500px' }}>
            <div style={{ padding: '20px', color: '#333', fontFamily: 'Georgia, serif' }}>
              <h3 style={{ color: '#1E5F74', marginBottom: '1rem' }}>Availability</h3>
              <div style={{ 
                padding: '15px', 
                borderRadius: '5px', 
                background: book.AvailableCopies > 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(247, 86, 124, 0.1)',
                border: `1px solid ${book.AvailableCopies > 0 ? '#34C759' : '#F7567C'}`,
                marginBottom: '1rem'
              }}>
                <p style={{ 
                  fontWeight: 'bold',
                  color: book.AvailableCopies > 0 ? '#34C759' : '#F7567C'
                }}>
                  {book.AvailableCopies > 0 ? 'Available' : 'Currently Unavailable'}
                </p>
                <p>{book.AvailableCopies} of {book.TotalCopies} copies available</p>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: '#1E5F74', marginBottom: '0.5rem' }}>Location</h4>
                <p>{book.Location || 'Main Section'}, {book.BranchName || 'Main Library'}</p>
              </div>
              
              <button style={{
                padding: '10px 20px',
                background: book.AvailableCopies > 0 ? '#1E5F74' : '#F7567C',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                marginTop: '1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                {book.AvailableCopies > 0 ? 'Borrow Book' : 'Reserve Book'}
              </button>
            </div>
          </Html>
        );
      case 3:
        return (
          <Html transform position={[0, 0, 0.01]} className="book-page-content" style={{ width: '500px' }}>
            <div style={{ padding: '20px', color: '#333', fontFamily: 'Georgia, serif' }}>
              <h3 style={{ color: '#1E5F74', marginBottom: '1rem' }}>Reviews</h3>
              {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((review, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '1rem', 
                    padding: '10px', 
                    borderBottom: '1px solid #eee' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 'bold' }}>{review.memberName}</p>
                      <div style={{ color: '#F9A602' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet for this book.</p>
              )}
            </div>
          </Html>
        );
      case 4:
        return (
          <Html transform position={[0, 0, 0.01]} className="book-page-content" style={{ width: '500px' }}>
            <div style={{ padding: '20px', color: '#333', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
              <h3 style={{ color: '#1E5F74', marginBottom: '1rem' }}>About the Author</h3>
              <p style={{ 
                fontStyle: 'italic', 
                fontSize: '1.2rem',
                marginBottom: '1rem' 
              }}>
                {book.AuthorFirstName} {book.AuthorLastName}
              </p>
              <p>
                {book.AuthorBio || `No biographical information available for ${book.AuthorFirstName} ${book.AuthorLastName}.`}
              </p>
              
              <div style={{ 
                marginTop: '2rem', 
                padding: '15px', 
                borderRadius: '5px',
                background: 'rgba(30, 95, 116, 0.1)',
                border: '1px solid #1E5F74'
              }}>
                <p style={{ fontStyle: 'italic' }}>
                  "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
                </p>
                <p style={{ textAlign: 'right', marginTop: '0.5rem' }}>— Dr. Seuss</p>
              </div>
            </div>
          </Html>
        );
      default:
        return null;
    }
  };
  
  return (
    <group ref={groupRef}>
      {/* Book cover */}
      <group ref={pagesRef} rotation={[0, 0, 0]}>
        {/* Left page (back cover) */}
        <mesh position={[-bookWidth/4, 0, 0]} castShadow>
          <boxGeometry args={[bookWidth/2, bookHeight, bookDepth]} />
          <meshStandardMaterial color={coverColor} roughness={0.7} metalness={0.1} />
          
          {/* Page content */}
          {getPageContent(currentPage)}
        </mesh>
        
        {/* Right page (front cover) */}
        <mesh position={[bookWidth/4, 0, 0]} castShadow>
          <boxGeometry args={[bookWidth/2, bookHeight, bookDepth]} />
          <meshStandardMaterial color={coverColor} roughness={0.7} metalness={0.1} />
          
          {/* Book title on cover */}
          <Text
            position={[0, 0, bookDepth/2 + 0.01]}
            fontSize={0.25}
            maxWidth={bookWidth/2 - 0.2}
            textAlign="center"
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/LibreBaskerville-Regular.ttf"
          >
            {book.Title || 'Book Title'}
          </Text>
          
          {/* Author name on cover */}
          <Text
            position={[0, -1, bookDepth/2 + 0.01]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/LibreBaskerville-Italic.ttf"
          >
            by {book.AuthorFirstName} {book.AuthorLastName}
          </Text>
        </mesh>
      </group>
      
      {/* Navigation dots */}
      <group position={[0, -bookHeight/2 - 0.5, 0]}>
        {[...Array(numPages)].map((_, i) => (
          <mesh
            key={`dot-${i}`}
            position={[(i - numPages/2 + 0.5) * 0.3, 0, 0]}
            onClick={() => setCurrentPage(i)}
            onPointerOver={() => setHoveredPage(i)}
            onPointerOut={() => setHoveredPage(null)}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color={currentPage === i ? '#F7567C' : '#1E5F74'} 
              emissive={hoveredPage === i ? '#F7567C' : 'black'} 
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      
      {/* Close button */}
      <mesh
        position={[bookWidth/2 + 0.5, bookHeight/2 + 0.5, 0]}
        onClick={handleClose}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial color="#F7567C" />
        
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          X
        </Text>
      </mesh>
    </group>
  );
};

export default BookDetailView;