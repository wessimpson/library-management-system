import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Stars,
  Html,
  useProgress
} from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

import Bookshelf from './Bookshelf';
import BookDetailView from './BookDetailView';

// Loading spinner component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#1E5F74',
        fontFamily: 'Playfair Display, serif'
      }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '1rem' }}>
          <div style={{
            position: 'absolute',
            border: '4px solid rgba(30, 95, 116, 0.3)',
            borderTop: '4px solid #1E5F74',
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <h3>{progress.toFixed(0)}% loaded</h3>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </Html>
  );
};

// Camera controller that creates smooth camera movements
const CameraController = ({ selectedBook }) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  useEffect(() => {
    if (selectedBook) {
      // Move camera to focus on the selected book
      gsap.to(camera.position, {
        duration: 1.5,
        x: 0,
        y: 0,
        z: 6,
        ease: "power2.inOut"
      });
      
      if (controlsRef.current) {
        // Disable controls when viewing a book detail
        controlsRef.current.enabled = false;
      }
    } else {
      // Reset camera position when closing book details
      gsap.to(camera.position, {
        duration: 1.5,
        x: 5,
        y: 0,
        z: 10,
        ease: "power2.inOut"
      });
      
      if (controlsRef.current) {
        // Re-enable controls
        controlsRef.current.enabled = true;
      }
    }
  }, [selectedBook, camera]);
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      maxDistance={20}
      minDistance={4}
    />
  );
};

// Main lights for the scene
const SceneLights = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <spotLight 
        position={[-10, 10, -10]} 
        intensity={0.5} 
        angle={0.3} 
        penumbra={0.8}
      />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#F7567C" />
    </>
  );
};

// Library room environment
const LibraryRoom = () => {
  // Create a simple room enclosure
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 0, -5]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
      
      {/* Floor */}
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-15, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[15, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#f5f2ee" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Main scene component
const Scene = ({ books }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  
  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };
  
  const handleCloseBookDetail = () => {
    setSelectedBook(null);
  };
  
  return (
    <>
      <CameraController selectedBook={selectedBook} />
      <SceneLights />
      
      <LibraryRoom />
      
      {/* Main bookshelf with books */}
      <Suspense fallback={<Loader />}>
        {!selectedBook && (
          <Bookshelf books={books} onSelectBook={handleSelectBook} />
        )}
        
        {/* Book detail view when a book is selected */}
        {selectedBook && (
          <BookDetailView book={selectedBook} onClose={handleCloseBookDetail} />
        )}
      </Suspense>
      
      {/* Decorative elements */}
      <Stars radius={100} depth={50} count={1000} factor={4} fade />
    </>
  );
};

// Main exported component
const BookshelfScene = ({ books = [] }) => {
  // Set up fonts before rendering
  useEffect(() => {
    // Create public/fonts directory if it doesn't exist
    const loadFonts = async () => {
      // This would ideally download fonts, but we're simulating it here
      console.log("Fonts would be loaded here in a real implementation");
    };
    
    loadFonts();
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows dpr={[1, 2]}>
        <fog attach="fog" args={['#f5f3ef', 10, 25]} />
        <color attach="background" args={['#f5f3ef']} />
        
        <PerspectiveCamera makeDefault position={[5, 0, 10]} fov={60} />
        
        <Scene books={books} />
        
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default BookshelfScene;