import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components
const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    z-index: -1;
    transition: all 0.6s ease;
    opacity: 0;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const Highlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(
    circle,
    rgba(247, 86, 124, 0.2) 0%,
    rgba(247, 86, 124, 0) 70%
  );
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
`;

// Variants for animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hover: {
    y: -10,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// FloatingCard component
const FloatingCard = ({ children, delay = 0, ...props }) => {
  const highlightRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (highlightRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      highlightRef.current.style.opacity = '1';
      highlightRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (highlightRef.current) {
      highlightRef.current.style.opacity = '0';
    }
  };

  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <Highlight ref={highlightRef} />
      {children}
    </CardContainer>
  );
};

export default FloatingCard;