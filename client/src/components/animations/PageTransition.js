import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// Styled components
const PageWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: calc(100vh - 160px);
`;

const TransitionLayer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.color || '#1E5F74'};
  z-index: 9999;
  pointer-events: none;
`;

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const transitionVariants = {
  initial: {
    y: '100%',
    height: '100%',
  },
  animate: {
    y: '-100%',
    height: '100%',
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    y: ['0%', '100%'],
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Page transition component
const PageTransition = ({ children, color, key }) => {
  return (
    <AnimatePresence mode="wait">
      <PageWrapper
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <TransitionLayer 
          color={color}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={transitionVariants}
        />
        {children}
      </PageWrapper>
    </AnimatePresence>
  );
};

// For individual items within the page
export const FadeInItem = ({ children, delay = 0, ...props }) => {
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay
      }
    },
    exit: { 
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;