import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  opacity: 0.6;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const AbstractBackground = ({ style }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Recreate particles
      particles = [];
      createParticles();
    };

    const createParticles = () => {
      const particleCount = Math.floor(width * height / 10000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1,
          color: getRandomColor(),
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      
      // Add larger floating shapes
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 50 + 20,
          color: getRandomColor(),
          speedX: (Math.random() * 0.2 - 0.1) * 0.5,
          speedY: (Math.random() * 0.2 - 0.1) * 0.5,
          opacity: Math.random() * 0.2 + 0.05,
          shape: Math.floor(Math.random() * 3) // 0: circle, 1: square, 2: triangle
        });
      }
    };

    const getRandomColor = () => {
      const colors = [
        '#1E5F74', // primary
        '#68BBD5', // primary light
        '#2D3B55', // secondary
        '#F7567C', // accent
        '#FF99AF'  // accent light
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const drawParticle = (particle) => {
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      
      if (particle.shape === undefined) {
        // Small particles are always circles
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.shape === 0) {
        // Large circle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.shape === 1) {
        // Square
        ctx.fillRect(
          particle.x - particle.radius / 2, 
          particle.y - particle.radius / 2, 
          particle.radius, 
          particle.radius
        );
      } else {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y - particle.radius / 2);
        ctx.lineTo(particle.x + particle.radius / 2, particle.y + particle.radius / 2);
        ctx.lineTo(particle.x - particle.radius / 2, particle.y + particle.radius / 2);
        ctx.closePath();
        ctx.fill();
      }
      
      // Reset alpha
      ctx.globalAlpha = 1;
    };

    const drawConnection = (p1, p2) => {
      const distance = Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
      );
      
      if (distance < 150) {
        ctx.beginPath();
        ctx.strokeStyle = '#1E5F74';
        ctx.globalAlpha = 0.1 * (1 - distance / 150);
        ctx.lineWidth = 0.6;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    const updateParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Boundaries check
        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        drawParticle(particles[i]);
      }
      
      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          drawConnection(particles[i], particles[j]);
        }
      }
      
      // Update particles for next frame
      updateParticles();
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    resizeCanvas();
    
    // Start animation
    animate();
    
    // Add event listener for window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <BackgroundContainer style={style}>
      <Canvas ref={canvasRef} />
    </BackgroundContainer>
  );
};

export default AbstractBackground;