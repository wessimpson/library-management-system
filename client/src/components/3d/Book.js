import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const Book = ({ 
  book, 
  position, 
  rotation = [0, 0, 0], 
  onSelect,
  index 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Calculate book dimensions based on book attributes
  const getBookDimensions = () => {
    // Base dimensions
    const baseWidth = 0.8;
    const baseHeight = 1.2;
    const baseDepth = 0.2;
    
    // Randomize slightly for more natural look
    const widthVariation = 0.2 * Math.random();
    const heightVariation = 0.3 * Math.random();
    const depthVariation = 0.1 * Math.random();
    
    return [
      baseWidth + widthVariation, 
      baseHeight + heightVariation, 
      baseDepth + depthVariation
    ];
  };
  
  // Get color based on genre
  const getBookColor = () => {
    const genreColors = {
      'Fiction': '#6b4226',       // Brown
      'Non-Fiction': '#2d3b55',   // Navy blue
      'Science': '#1E5F74',       // Teal
      'History': '#8B4513',       // Saddle brown
      'Biography': '#4A6741',     // Forest green
      'Mystery': '#800020',       // Burgundy
      'Fantasy': '#702963',       // Purple
      'Romance': '#F7567C',       // Pink
      'Science Fiction': '#3457D5' // Royal blue
    };
    
    return book.Genre && genreColors[book.Genre] 
      ? genreColors[book.Genre] 
      : '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
  };
  
  const dimensions = getBookDimensions();
  const bookColor = getBookColor();
  
  // Spring animations for hover and click effects
  const { bookScale, bookPositionX, spineColor } = useSpring({
    bookScale: hovered ? 1.05 : 1,
    bookPositionX: clicked ? position[0] + 0.5 : position[0],
    spineColor: hovered ? '#F7567C' : bookColor,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Handle interaction
  const handleClick = (event) => {
    event.stopPropagation();
    setClicked(!clicked);
    if (!clicked) {
      if (onSelect) onSelect(book);
    }
  };
  
  // Subtle animation
  useFrame((state) => {
    if (meshRef.current && hovered && !clicked) {
      // Subtle floating effect when hovered
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
    }
  });

  // Determine if this book is available (for visual indicator)
  const isAvailable = book.AvailableCopies > 0;
  
  // Create book materials
  const createMaterials = () => {
    // Create an array of 6 materials for each side of the book
    const materials = [];
    
    // Spine material (front side)
    const spineMaterial = new THREE.MeshStandardMaterial({ 
      color: bookColor,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Cover material
    const coverMaterial = new THREE.MeshStandardMaterial({ 
      color: bookColor,
      roughness: 0.7,
      metalness: 0.1,
    });
    
    // Pages material (slightly off-white)
    const pagesMaterial = new THREE.MeshStandardMaterial({ 
      color: '#f8f5e6',
      roughness: 0.5
    });
    
    // Order is: right, left, top, bottom, front, back
    materials.push(
      coverMaterial,      // right side - front cover
      coverMaterial,      // left side - back cover
      pagesMaterial,      // top side - top pages
      pagesMaterial,      // bottom side - bottom pages
      spineMaterial,      // front side - spine
      pagesMaterial       // back side - page ends
    );
    
    return materials;
  };
  
  return (
    <animated.group
      position={[bookPositionX, position[1], position[2]]}
      rotation={rotation}
      scale={bookScale}
    >
      {/* Book mesh */}
      <animated.mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={dimensions} />
        <meshStandardMaterial attach="material-0" color={bookColor} roughness={0.7} />
        <meshStandardMaterial attach="material-1" color={bookColor} roughness={0.7} />
        <meshStandardMaterial attach="material-2" color="#f8f5e6" roughness={0.5} /> {/* Top */}
        <meshStandardMaterial attach="material-3" color="#f8f5e6" roughness={0.5} /> {/* Bottom */}
        <animated.meshStandardMaterial attach="material-4" color={spineColor} roughness={0.7} /> {/* Spine */}
        <meshStandardMaterial attach="material-5" color="#f8f5e6" roughness={0.5} /> {/* Page edges */}
      </animated.mesh>
      
      {/* Book spine text */}
      <Text
        position={[0, 0, dimensions[2]/2 + 0.01]}
        rotation={[0, 0, Math.PI/2]}
        fontSize={0.12}
        maxWidth={dimensions[1] * 0.9}
        lineHeight={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/LibreBaskerville-Regular.ttf"
      >
        {book.Title || `Book ${index}`}
      </Text>
      
      {/* Availability indicator */}
      {isAvailable && (
        <mesh position={[0, dimensions[1]/2 - 0.1, dimensions[2]/2 + 0.01]}>
          <circleGeometry args={[0.1, 32]} />
          <meshBasicMaterial color="#34c759" />
        </mesh>
      )}
    </animated.group>
  );
};

export default Book;