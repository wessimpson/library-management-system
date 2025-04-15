import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import Book from './Book';

const SHELF_WIDTH = 10;
const SHELF_HEIGHT = 0.15;
const SHELF_DEPTH = 1.5;
const SHELF_COLOR = '#8B4513';
const SHELF_SPACING = 2;
const BOOKS_PER_SHELF = 8;

const Bookshelf = ({ books = [], onSelectBook }) => {
  const shelfRef = useRef();
  
  // Organize books by shelves
  const organizeBooks = () => {
    const organizedBooks = [];
    const shelfCount = Math.ceil(books.length / BOOKS_PER_SHELF);
    
    for (let shelfIndex = 0; shelfIndex < shelfCount; shelfIndex++) {
      const shelfBooks = books.slice(
        shelfIndex * BOOKS_PER_SHELF, 
        (shelfIndex + 1) * BOOKS_PER_SHELF
      );
      
      const shelfY = -shelfIndex * SHELF_SPACING;
      
      // Position books on this shelf
      let currentX = -SHELF_WIDTH / 2 + 0.5; // Start from left with some padding
      
      const positionedBooks = shelfBooks.map((book, bookIndex) => {
        // Calculate book width (will be refined in the Book component)
        const bookWidth = 0.8 + 0.2 * Math.random();
        
        // Position book
        const bookPosition = [
          currentX + bookWidth / 2,
          shelfY + 0.7, // Place book on shelf with some offset
          0
        ];
        
        // Update next book position
        currentX += bookWidth + 0.1; // Add small gap between books
        
        return {
          ...book,
          position: bookPosition,
          shelfIndex,
          bookIndex
        };
      });
      
      organizedBooks.push({
        shelfY,
        books: positionedBooks
      });
    }
    
    return organizedBooks;
  };
  
  const shelves = organizeBooks();

  return (
    <group ref={shelfRef}>
      {shelves.map((shelf, shelfIndex) => (
        <group key={`shelf-${shelfIndex}`} position={[0, shelf.shelfY, 0]}>
          {/* Wooden shelf */}
          <mesh 
            position={[0, 0, 0]} 
            receiveShadow
            castShadow
          >
            <boxGeometry args={[SHELF_WIDTH, SHELF_HEIGHT, SHELF_DEPTH]} />
            <meshStandardMaterial 
              color={SHELF_COLOR} 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          
          {/* Shelf supports */}
          <mesh position={[-SHELF_WIDTH/2 + 0.1, -SHELF_SPACING/2, 0]} castShadow>
            <boxGeometry args={[0.2, SHELF_SPACING - SHELF_HEIGHT, SHELF_DEPTH]} />
            <meshStandardMaterial color={SHELF_COLOR} roughness={0.8} />
          </mesh>
          
          <mesh position={[SHELF_WIDTH/2 - 0.1, -SHELF_SPACING/2, 0]} castShadow>
            <boxGeometry args={[0.2, SHELF_SPACING - SHELF_HEIGHT, SHELF_DEPTH]} />
            <meshStandardMaterial color={SHELF_COLOR} roughness={0.8} />
          </mesh>
          
          {/* Shelf label */}
          <Text
            position={[-SHELF_WIDTH/2 + 0.3, 0.25, SHELF_DEPTH/2 + 0.01]}
            fontSize={0.2}
            color="#1E5F74"
            anchorX="left"
            anchorY="middle"
            font="/fonts/LibreBaskerville-Bold.ttf"
          >
            {shelfIndex === 0 ? 'Featured' : 
             shelfIndex === 1 ? 'Popular' : 
             shelfIndex === 2 ? 'New Arrivals' : 
             `Shelf ${shelfIndex + 1}`}
          </Text>
          
          {/* Books on this shelf */}
          {shelf.books.map((book, bookIndex) => (
            <Book
              key={`book-${book.BookID || bookIndex}`}
              book={book}
              position={book.position}
              index={bookIndex}
              onSelect={onSelectBook}
            />
          ))}
        </group>
      ))}
    </group>
  );
};

export default Bookshelf;