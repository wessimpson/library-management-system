import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const BookshelfContainer = styled.div`
  width: 100%;
  height: calc(100vh - 70px); /* Account for navbar */
  position: relative;
  overflow: hidden;
  background-color: #f5f3ef;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const BookInfoPanel = styled(motion.div)`
  position: fixed;
  bottom: 5%;
  right: 5%;
  width: 90%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform-origin: bottom right;
  
  /* Add decorative book binding texture to the left side */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: #1E5F74;
    border-radius: 16px 0 0 16px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #F7567C;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e83a64;
    transform: rotate(90deg);
  }
`;

const BookTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: #1E5F74;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  padding-right: 30px;
`;

const BookAuthor = styled.p`
  font-style: italic;
  color: #6C7A89;
  margin-bottom: 1.5rem;
`;

const BookDetail = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: #1E5F74;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }
  
  p {
    line-height: 1.6;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
`;

const BookAvailability = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.isAvailable === 'true' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(247, 86, 124, 0.1)'};
  border: 1px solid ${props => props.isAvailable === 'true' ? '#34C759' : '#F7567C'};
  margin-bottom: 1.5rem;
  
  p {
    color: ${props => props.isAvailable === 'true' ? '#2A8749' : '#D32F5D'};
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 0.9rem;
    color: #6C7A89;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  background: ${props => props.isAvailable === 'true' ? '#1E5F74' : '#F7567C'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  color: #1E5F74;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid rgba(30, 95, 116, 0.1);
    border-top-color: #1E5F74;
    animation: spin 1s linear infinite;
    margin-left: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Book Cover Image Generator - creates a visual cover instead of just a colored spine
class BookCover {
  constructor(ctx, data, x, y, width, height) {
    this.ctx = ctx;
    this.data = data;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = this.getColorByGenre();
    this.secondaryColor = this.getLighterColor(this.color, 50);
    this.patternType = Math.floor(Math.random() * 4); // 0-3 pattern types
  }

  getColorByGenre() {
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
    
    return this.data.Genre && genreColors[this.data.Genre] 
      ? genreColors[this.data.Genre] 
      : '#' + Math.floor(Math.random()*16777215).toString(16);
  }

  getLighterColor(hex, amount) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex string into RGB components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten each component
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  draw() {
    const ctx = this.ctx;
    
    // Save context for transformations
    ctx.save();
    
    // Draw book cover background
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Add pattern based on patternType
    switch (this.patternType) {
      case 0: // Striped
        this.drawStripedPattern();
        break;
      case 1: // Gradient
        this.drawGradientPattern();
        break;
      case 2: // Dotted
        this.drawDottedPattern();
        break;
      case 3: // Solid with border
      default:
        this.drawBorderedPattern();
        break;
    }
    
    // Add book title
    this.drawBookTitle();
    
    // Add author
    this.drawAuthor();
    
    // Add availability indicator
    if (this.data.AvailableCopies > 0) {
      this.drawAvailabilityIndicator();
    }
    
    ctx.restore();
  }
  
  drawStripedPattern() {
    const ctx = this.ctx;
    
    // Draw stripes
    ctx.fillStyle = this.secondaryColor;
    for (let i = 0; i < this.height; i += 15) {
      ctx.fillRect(this.x + 10, this.y + i, this.width - 20, 5);
    }
  }
  
  drawGradientPattern() {
    const ctx = this.ctx;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, this.secondaryColor);
    
    // Draw gradient rectangle slightly smaller than cover
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
  }
  
  drawDottedPattern() {
    const ctx = this.ctx;
    
    // Draw dots
    ctx.fillStyle = this.secondaryColor;
    
    for (let i = 15; i < this.width - 15; i += 15) {
      for (let j = 15; j < this.height - 15; j += 15) {
        ctx.beginPath();
        ctx.arc(this.x + i, this.y + j, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  drawBorderedPattern() {
    const ctx = this.ctx;
    
    // Draw border
    ctx.strokeStyle = this.secondaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
  }
  
  drawBookTitle() {
    const ctx = this.ctx;
    const title = this.data.Title || 'Unknown Title';
    
    // Draw title box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x + 10, this.y + this.height / 3, this.width - 20, 40);
    
    // Draw title text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // Handle long titles
    if (title.length > 20) {
      const words = title.split(' ');
      let line1 = '';
      let line2 = '';
      
      // Split into two lines
      for (const word of words) {
        if ((line1 + word).length < 18) {
          line1 += word + ' ';
        } else {
          line2 += word + ' ';
        }
      }
      
      // Draw two lines
      ctx.fillText(line1.trim(), this.x + this.width / 2, this.y + this.height / 3 + 15);
      ctx.fillText(line2.trim(), this.x + this.width / 2, this.y + this.height / 3 + 35);
    } else {
      // Draw single line
      ctx.fillText(title, this.x + this.width / 2, this.y + this.height / 3 + 25);
    }
  }
  
  drawAuthor() {
    const ctx = this.ctx;
    const author = `${this.data.AuthorFirstName || ''} ${this.data.AuthorLastName || 'Unknown'}`;
    
    // Draw author name
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x + 10, this.y + this.height - 40, this.width - 20, 25);
    
    ctx.fillStyle = 'white';
    ctx.font = 'italic 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(author, this.x + this.width / 2, this.y + this.height - 25);
  }
  
  drawAvailabilityIndicator() {
    const ctx = this.ctx;
    
    // Draw a small green circle in the top right
    ctx.fillStyle = '#34C759';
    ctx.beginPath();
    ctx.arc(this.x + this.width - 15, this.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a check mark or available text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', this.x + this.width - 15, this.y + 18);
  }
}

// Library Shelf class - represents a row of books
class Bookshelf {
  constructor(ctx, x, y, width, height, books = [], label = '', index = 0) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.books = books;
    this.label = label;
    this.index = index;
    
    // Shelf colors and properties
    this.shelfColor = '#8B4513';
    this.shelfShadowColor = 'rgba(0, 0, 0, 0.2)';
    this.labelColor = '#1E5F74';
    this.labelHoverScale = 1;
    this.animationOffset = 0;
    
    // Book covers
    this.bookCovers = [];
    this.initBookCovers();
  }
  
  initBookCovers() {
    const bookWidth = 80;
    const bookHeight = 120;
    const spacing = 10;
    const maxBooksPerShelf = Math.floor(this.width / (bookWidth + spacing));
    const books = this.books.slice(0, maxBooksPerShelf);
    
    // Calculate starting position to center books
    const totalBooksWidth = books.length * (bookWidth + spacing) - spacing;
    let startX = this.x + (this.width - totalBooksWidth) / 2;
    
    // Create book covers
    books.forEach((book, index) => {
      const cover = new BookCover(
        this.ctx,
        book,
        startX + index * (bookWidth + spacing),
        this.y - bookHeight - 10,  // Position above shelf
        bookWidth,
        bookHeight
      );
      
      this.bookCovers.push({
        cover,
        book,
        index,
        hoverOffset: 0,
        isHovered: false,
        isSelected: false,
        selectionOffset: 0
      });
    });
  }
  
  draw(mouseX, mouseY) {
    // Update hover states for books
    this.updateBookStates(mouseX, mouseY);
    
    // Draw shelf
    this.drawShelf();
    
    // Draw shelf label
    this.drawLabel(mouseX, mouseY);
    
    // Draw books
    this.drawBooks();
  }
  
  updateBookStates(mouseX, mouseY) {
    this.bookCovers.forEach(bookObj => {
      const cover = bookObj.cover;
      
      // Check if mouse is over this book
      const isHovered = 
        mouseX >= cover.x &&
        mouseX <= cover.x + cover.width &&
        mouseY >= cover.y &&
        mouseY <= cover.y + cover.height;
      
      // Update hover offset for animation
      if (isHovered && !bookObj.isHovered) {
        bookObj.isHovered = true;
      } else if (!isHovered && bookObj.isHovered) {
        bookObj.isHovered = false;
      }
      
      // Animate hover effect
      if (bookObj.isHovered && bookObj.hoverOffset < 20) {
        bookObj.hoverOffset += 2;
      } else if (!bookObj.isHovered && bookObj.hoverOffset > 0) {
        bookObj.hoverOffset -= 2;
      }
      
      // Animate selection effect
      if (bookObj.isSelected && bookObj.selectionOffset < 40) {
        bookObj.selectionOffset += 3;
      } else if (!bookObj.isSelected && bookObj.selectionOffset > 0) {
        bookObj.selectionOffset -= 3;
      }
    });
  }
  
  drawShelf() {
    const ctx = this.ctx;
    
    // Draw main shelf
    ctx.fillStyle = this.shelfColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw shelf shadow
    ctx.fillStyle = this.shelfShadowColor;
    ctx.fillRect(this.x, this.y + this.height, this.width, 5);
    
    // Draw shelf sides (3D effect)
    ctx.fillStyle = this.shelfColor;
    
    // Left side
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 10, this.y + 10);
    ctx.lineTo(this.x - 10, this.y + this.height + 10);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Right side
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + this.width + 10, this.y + 10);
    ctx.lineTo(this.x + this.width + 10, this.y + this.height + 10);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Bottom side
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x - 10, this.y + this.height + 10);
    ctx.lineTo(this.x + this.width + 10, this.y + this.height + 10);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Wood grain texture
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    for (let i = 0; i < this.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(this.x + i, this.y);
      ctx.lineTo(this.x + i, this.y + this.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  drawLabel(mouseX, mouseY) {
    const ctx = this.ctx;
    const labelWidth = 200;
    const labelHeight = 40;
    const labelX = this.x + 20;
    const labelY = this.y - 60 - this.animationOffset; // Position above shelf
    
    // Check if mouse is over the label
    const isLabelHovered = 
      mouseX >= labelX &&
      mouseX <= labelX + labelWidth &&
      mouseY >= labelY &&
      mouseY <= labelY + labelHeight;
    
    // Update hover animation
    if (isLabelHovered) {
      this.labelHoverScale = Math.min(1.1, this.labelHoverScale + 0.01);
      this.animationOffset = Math.min(5, this.animationOffset + 0.5);
    } else {
      this.labelHoverScale = Math.max(1, this.labelHoverScale - 0.01);
      this.animationOffset = Math.max(0, this.animationOffset - 0.5);
    }
    
    // Draw label
    ctx.save();
    
    // Create gradient
    const gradient = ctx.createLinearGradient(labelX, labelY, labelX, labelY + labelHeight);
    gradient.addColorStop(0, this.labelColor);
    gradient.addColorStop(1, '#133B49');
    
    // Draw label background
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    // Rounded rectangle
    ctx.beginPath();
    ctx.moveTo(labelX + 10, labelY);
    ctx.lineTo(labelX + labelWidth - 10, labelY);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + 10);
    ctx.lineTo(labelX + labelWidth, labelY + labelHeight - 10);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - 10, labelY + labelHeight);
    ctx.lineTo(labelX + 10, labelY + labelHeight);
    ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - 10);
    ctx.lineTo(labelX, labelY + 10);
    ctx.quadraticCurveTo(labelX, labelY, labelX + 10, labelY);
    ctx.closePath();
    ctx.fill();
    
    // Draw label text
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Scale text when hovered
    ctx.translate(labelX + labelWidth / 2, labelY + labelHeight / 2);
    ctx.scale(this.labelHoverScale, this.labelHoverScale);
    
    ctx.font = 'bold 16px "Playfair Display", serif';
    ctx.fillStyle = 'white';
    ctx.fillText(this.label, 0, 0);
    
    ctx.restore();
  }
  
  drawBooks() {
    // Draw all books
    this.bookCovers.forEach(bookObj => {
      const cover = bookObj.cover;
      
      // Apply hover animation
      if (bookObj.hoverOffset > 0 || bookObj.selectionOffset > 0) {
        cover.y -= (bookObj.hoverOffset + bookObj.selectionOffset);
        cover.draw();
        cover.y += (bookObj.hoverOffset + bookObj.selectionOffset);
      } else {
        cover.draw();
      }
    });
  }
  
  // Check if a book is clicked and return the book data
  checkBookClick(x, y) {
    for (const bookObj of this.bookCovers) {
      const cover = bookObj.cover;
      
      // Check if click is inside book boundaries (including hover offset)
      if (
        x >= cover.x &&
        x <= cover.x + cover.width &&
        y >= cover.y - bookObj.hoverOffset - bookObj.selectionOffset &&
        y <= cover.y + cover.height - bookObj.hoverOffset - bookObj.selectionOffset
      ) {
        // Mark this book as selected
        this.bookCovers.forEach(b => {
          b.isSelected = (b === bookObj);
        });
        
        return bookObj.book;
      }
    }
    
    return null;
  }
  
  // Deselect all books
  deselectAllBooks() {
    this.bookCovers.forEach(bookObj => {
      bookObj.isSelected = false;
    });
  }
}

// Library Scene class - manages the entire 3D library scene
class Library {
  constructor(canvas, books = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.books = books;
    this.shelves = [];
    this.selectedBook = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Environment properties
    this.wallColor = '#f5f3ef';
    this.floorColor = '#8B5A2B';
    this.lightSource = {
      x: canvas.width * 0.3,
      y: 50,
      radius: 500,
      intensity: 0.3,
      flicker: 0,
      flickerSpeed: 0.02
    };
    
    // Initialize
    this.initShelves();
    this.initParticles();
  }
  
  initShelves() {
    // Group books by genre
    const booksByGenre = {};
    
    this.books.forEach(book => {
      const genre = book.Genre || 'General';
      if (!booksByGenre[genre]) {
        booksByGenre[genre] = [];
      }
      booksByGenre[genre].push(book);
    });
    
    // Create shelves for each genre
    const shelfWidth = Math.min(this.canvas.width - 100, 1200);
    const shelfHeight = 20;
    const shelfSpacing = 220;
    const startX = (this.canvas.width - shelfWidth) / 2;
    
    let index = 0;
    for (const [genre, books] of Object.entries(booksByGenre)) {
      const shelfY = 150 + index * shelfSpacing;
      
      // Skip if we would go offscreen
      if (shelfY + 200 > this.canvas.height) break;
      
      this.shelves.push(
        new Bookshelf(
          this.ctx,
          startX,
          shelfY,
          shelfWidth,
          shelfHeight,
          books,
          genre,
          index
        )
      );
      
      index++;
    }
  }
  
  initParticles() {
    // Create gentle sunbeam rays coming through window
    const sunbeamCount = 5;
    
    // Add elegant sunbeam rays from window
    for (let i = 0; i < sunbeamCount; i++) {
      const width = 20 + Math.random() * 30;
      this.particles.push({
        type: 'sunbeam',
        x: this.canvas.width * 0.75 + (Math.random() * 50 - 25), // Position near window
        y: 80 + Math.random() * 40,
        width: width,
        height: this.canvas.height * 0.7,
        angle: -Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 0.02 + Math.random() * 0.03,
        pulseSpeed: 0.001 + Math.random() * 0.002,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    
    // Create subtle dust particles in sunbeams
    const dustParticleCount = 30;
    for (let i = 0; i < dustParticleCount; i++) {
      this.particles.push({
        type: 'dust',
        x: this.canvas.width * 0.7 + Math.random() * 100,
        y: 100 + Math.random() * 200,
        size: 0.5 + Math.random() * 1.5,
        speedX: Math.random() * 0.08 - 0.04,
        speedY: -0.05 - Math.random() * 0.05,
        opacity: 0.05 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI * 2,
        // Let dust particles drift slowly
        lifespan: 200 + Math.random() * 300, // frames it will live
        age: 0
      });
    }
    
    // Add ambient particle effect (very subtle)
    const ambientParticleCount = 10;
    for (let i = 0; i < ambientParticleCount; i++) {
      this.particles.push({
        type: 'ambient',
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.canvas.height * 0.7),
        size: 0.5 + Math.random() * 1,
        opacity: 0.01 + Math.random() * 0.03,
        speed: 0.1 + Math.random() * 0.2,
        angle: Math.random() * Math.PI * 2,
        waveAmplitude: 0.2 + Math.random() * 0.5,
        waveFrequency: 0.001 + Math.random() * 0.003,
        wavePhase: Math.random() * Math.PI * 2
      });
    }
  }
  
  // Add click particles at the given position
  addClickParticles(x, y) {
    // Create a more elegant ripple effect when clicking
    this.particles.push({
      type: 'ripple',
      x: x,
      y: y,
      size: 0, // Start at zero and grow
      maxSize: 40 + Math.random() * 20,
      growSpeed: 0.8 + Math.random() * 0.5,
      opacity: 0.5,
      color: '#1E5F74'
    });
    
    // Add a few sparkling particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        type: 'sparkle',
        x: x,
        y: y,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: 0.6 + Math.random() * 0.4,
        life: 1, // Full life
        decay: 0.02 + Math.random() * 0.03, // How fast it fades
        color: '#F7567C'
      });
    }
  }
  
  // Handle mouse move
  handleMouseMove(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }
  
  // Handle click
  handleClick(x, y) {
    // Check if we clicked on a book
    for (const shelf of this.shelves) {
      const clickedBook = shelf.checkBookClick(x, y);
      
      if (clickedBook) {
        // Deselect books on other shelves
        this.shelves.forEach(s => {
          if (s !== shelf) {
            s.deselectAllBooks();
          }
        });
        
        // Add click particles
        this.addClickParticles(x, y);
        
        return clickedBook;
      }
    }
    
    return null;
  }
  
  // Update scene state
  update() {
    // Update particles
    this.updateParticles();
    
    // Update light flicker
    this.lightSource.flicker = Math.sin(Date.now() * this.lightSource.flickerSpeed) * 0.05;
    
    // Update light position to follow mouse slightly
    this.lightSource.x += (this.mouseX * 0.1 - this.lightSource.x * 0.1) * 0.02;
  }
  
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      switch (p.type) {
        case 'sunbeam':
          // Gently pulse the sunbeam opacity
          p.currentOpacity = p.opacity + Math.sin(Date.now() * p.pulseSpeed + p.pulsePhase) * p.opacity * 0.3;
          break;
          
        case 'dust':
          // Move dust particles slowly
          p.x += p.speedX;
          p.y += p.speedY;
          p.age++;
          
          // If dust particle has lived its life or moved out of view, reset it
          if (p.age > p.lifespan || p.y < 0) {
            // Reset particle to new position near the window
            p.x = this.canvas.width * 0.7 + Math.random() * 100;
            p.y = 100 + Math.random() * 200;
            p.age = 0;
            p.lifespan = 200 + Math.random() * 300;
          }
          break;
          
        case 'ambient':
          // Move ambient particles in gentle wave patterns
          const time = Date.now() * p.waveFrequency;
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed + Math.sin(time + p.wavePhase) * p.waveAmplitude;
          
          // Wrap around screen edges
          if (p.x < 0) p.x = this.canvas.width;
          if (p.x > this.canvas.width) p.x = 0;
          if (p.y < 0) p.y = this.canvas.height * 0.7;
          if (p.y > this.canvas.height * 0.7) p.y = 0;
          break;
          
        case 'ripple':
          // Grow ripple effect
          p.size += p.growSpeed;
          p.opacity -= p.growSpeed / p.maxSize;
          
          // Remove when it reaches max size or becomes transparent
          if (p.size >= p.maxSize || p.opacity <= 0) {
            this.particles.splice(i, 1);
            i--;
          }
          break;
          
        case 'sparkle':
          // Standard sparkle animation
          p.life -= p.decay;
          p.opacity = p.life * 0.8;
          p.x += p.speedX;
          p.y += p.speedY;
          
          // Remove dead particles
          if (p.life <= 0) {
            this.particles.splice(i, 1);
            i--;
          }
          break;
          
        default:
          // Legacy particle code for any untyped particles
          if (p.life !== undefined) {
            p.life -= p.decay;
            p.opacity = p.life * 0.8;
            
            if (p.life <= 0) {
              this.particles.splice(i, 1);
              i--;
              continue;
            }
          }
          
          p.x += p.speedX || 0;
          p.y += p.speedY || 0;
          
          // Wrap around screen edges for regular particles
          if (p.life === undefined) {
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height * 0.7;
            if (p.y > this.canvas.height * 0.7) p.y = 0;
          }
      }
    }
  }
  
  // Draw the scene
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw room
    this.drawRoom();
    
    // Draw shelves
    this.shelves.forEach(shelf => {
      shelf.draw(this.mouseX, this.mouseY);
    });
    
    // Draw particles
    this.drawParticles();
  }
  
  drawRoom() {
    // Draw wall
    const wallHeight = this.canvas.height * 0.7;
    
    // Wall gradient (warm library color)
    const wallGradient = this.ctx.createLinearGradient(0, 0, 0, wallHeight);
    wallGradient.addColorStop(0, '#f5f3ef');
    wallGradient.addColorStop(1, '#e8e0d5');
    
    this.ctx.fillStyle = wallGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, wallHeight);
    
    // Draw wooden wainscoting (lower wall panel)
    const wainscotHeight = wallHeight * 0.3;
    const wainscotTop = wallHeight - wainscotHeight;
    const wainscotGradient = this.ctx.createLinearGradient(0, wainscotTop, 0, wallHeight);
    wainscotGradient.addColorStop(0, '#A0522D');
    wainscotGradient.addColorStop(1, '#8B4513');
    
    this.ctx.fillStyle = wainscotGradient;
    this.ctx.fillRect(0, wainscotTop, this.canvas.width, wainscotHeight);
    
    // Draw decorative border at top of wainscoting
    this.ctx.fillStyle = '#a57b55';
    this.ctx.fillRect(0, wainscotTop, this.canvas.width, 5);
    this.ctx.fillStyle = '#6A4012';
    this.ctx.fillRect(0, wainscotTop + 5, this.canvas.width, 2);
    
    // Draw wall paneling details
    const panelWidth = 150;
    const panelCount = Math.ceil(this.canvas.width / panelWidth);
    const panelInset = 10;
    const panelHeight = wainscotHeight - 15;
    
    this.ctx.fillStyle = '#8B5A2B';
    for (let i = 0; i < panelCount; i++) {
      this.ctx.fillRect(
        i * panelWidth + panelInset,
        wainscotTop + 12,
        panelWidth - panelInset * 2,
        panelHeight
      );
    }
    
    // Add subtle panel inner shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.fillStyle = '#6A4012';
    for (let i = 0; i < panelCount; i++) {
      this.ctx.fillRect(
        i * panelWidth + panelInset + 2,
        wainscotTop + 14,
        panelWidth - panelInset * 2 - 4,
        panelHeight - 4
      );
    }
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Draw wall pattern (subtle texture)
    this.ctx.globalAlpha = 0.03;
    this.ctx.fillStyle = '#000000';
    
    const patternSize = 20;
    const patternRows = Math.ceil(wainscotTop / patternSize);
    const patternCols = Math.ceil(this.canvas.width / patternSize);
    
    for (let row = 0; row < patternRows; row++) {
      for (let col = 0; col < patternCols; col++) {
        const x = col * patternSize;
        const y = row * patternSize;
        
        // Vary pattern based on position
        if ((row + col) % 2 === 0) {
          this.ctx.fillRect(x, y, patternSize, patternSize);
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
    
    // Draw floor
    const floorGradient = this.ctx.createLinearGradient(0, wallHeight, 0, this.canvas.height);
    floorGradient.addColorStop(0, '#8B5A2B');
    floorGradient.addColorStop(1, '#6A4012');
    
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, wallHeight, this.canvas.width, this.canvas.height - wallHeight);
    
    // Draw wood floor planks
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let i = wallHeight + 40; i < this.canvas.height; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }
    
    // Draw wood knots in the floor for realism
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 20; i++) {
      const knotX = Math.random() * this.canvas.width;
      const knotY = wallHeight + Math.random() * (this.canvas.height - wallHeight);
      const knotSize = 2 + Math.random() * 5;
      
      this.ctx.beginPath();
      this.ctx.arc(knotX, knotY, knotSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw ambient lighting
    this.drawAmbientLighting();
    
    // Draw wall decoration if canvas is wide enough
    if (this.canvas.width > 800) {
      this.drawWallDecoration();
    }
    
    // Draw small picture frame on left wall if canvas is wide enough
    if (this.canvas.width > 600) {
      this.drawPictureFrame();
    }
  }
  
  // Draw a small picture frame with library-themed image
  drawPictureFrame() {
    const frameX = this.canvas.width * 0.15;
    const frameY = 120;
    const frameWidth = 100;
    const frameHeight = 130;
    
    // Frame
    this.ctx.fillStyle = '#6A4012';
    this.ctx.fillRect(frameX - 8, frameY - 8, frameWidth + 16, frameHeight + 16);
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(frameX - 5, frameY - 5, frameWidth + 10, frameHeight + 10);
    
    // Picture background
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
    
    // Draw a simple antique book illustration
    // Book spine
    this.ctx.fillStyle = '#8B0000';
    this.ctx.fillRect(frameX + 25, frameY + 30, 50, 70);
    
    // Book pages
    this.ctx.fillStyle = '#f0e6d2';
    this.ctx.fillRect(frameX + 35, frameY + 30, 40, 65);
    
    // Page lines
    this.ctx.strokeStyle = '#d0c6b2';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(frameX + 37, frameY + 40 + i * 6);
      this.ctx.lineTo(frameX + 73, frameY + 40 + i * 6);
      this.ctx.stroke();
    }
    
    // Book title box
    this.ctx.fillStyle = '#e0c080';
    this.ctx.fillRect(frameX + 30, frameY + 45, 40, 15);
    
    // Signature at bottom
    this.ctx.fillStyle = '#8B4513';
    this.ctx.font = 'italic 8px serif';
    this.ctx.fillText('A. Scholar', frameX + frameWidth - 40, frameY + frameHeight - 10);
    
    // Frame reflection
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.moveTo(frameX, frameY);
    this.ctx.lineTo(frameX + 20, frameY);
    this.ctx.lineTo(frameX, frameY + 20);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawAmbientLighting() {
    // Get light intensity with flicker
    const intensity = this.lightSource.intensity + this.lightSource.flicker;
    
    // Create radial gradient for light
    const gradient = this.ctx.createRadialGradient(
      this.lightSource.x, this.lightSource.y, 0,
      this.lightSource.x, this.lightSource.y, this.lightSource.radius
    );
    
    gradient.addColorStop(0, `rgba(255, 255, 220, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 220, ${intensity/2})`);
    gradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
    
    // Apply light effect
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  drawWallDecoration() {
    // Draw a library window
    const windowX = this.canvas.width * 0.8;
    const windowY = 80;
    const windowWidth = 180;
    const windowHeight = 240;
    
    // Window frame outer edge (wooden)
    this.ctx.fillStyle = '#6A4012';
    this.ctx.fillRect(windowX - 15, windowY - 15, windowWidth + 30, windowHeight + 30);
    
    // Window frame inner edge
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(windowX - 10, windowY - 10, windowWidth + 20, windowHeight + 20);
    
    // Window glass background
    const timeOfDay = (Math.sin(Date.now() * 0.0001) + 1) / 2; // Value between 0 and 1 that slowly changes
    
    // Sky color changes subtly over time
    const skyGradient = this.ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowHeight);
    skyGradient.addColorStop(0, `rgba(${135 + timeOfDay * 20}, ${206 + timeOfDay * 15}, ${235}, 1)`); // Lighter at top
    skyGradient.addColorStop(1, `rgba(${220 - timeOfDay * 20}, ${230 + timeOfDay * 10}, ${255}, 1)`); // Darker at bottom
    
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
    
    // Window mullions (the dividers)
    this.ctx.fillStyle = '#6A4012';
    // Horizontal divider
    this.ctx.fillRect(windowX, windowY + windowHeight/2 - 5, windowWidth, 10);
    // Vertical divider
    this.ctx.fillRect(windowX + windowWidth/2 - 5, windowY, 10, windowHeight);
    
    // Draw window pane shadows
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    this.ctx.fillRect(windowX + 5, windowY + 5, windowWidth/2 - 10, windowHeight/2 - 10);
    this.ctx.fillRect(windowX + windowWidth/2 + 5, windowY + windowHeight/2 + 5, windowWidth/2 - 10, windowHeight/2 - 10);
    
    // Window sill
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(windowX - 20, windowY + windowHeight, windowWidth + 40, 15);
    
    // Gradients for 3D effect on sill
    const sillGradient = this.ctx.createLinearGradient(windowX - 20, windowY + windowHeight, windowX - 20, windowY + windowHeight + 15);
    sillGradient.addColorStop(0, '#A0522D');
    sillGradient.addColorStop(1, '#6A4012');
    this.ctx.fillStyle = sillGradient;
    this.ctx.fillRect(windowX - 20, windowY + windowHeight, windowWidth + 40, 15);
    
    // Outside scene visible through window
    
    // Distant trees silhouette
    for (let i = 0; i < 5; i++) {
      const treeHeight = 30 + Math.random() * 40;
      const treeWidth = 20 + Math.random() * 10;
      const treeX = windowX + 10 + i * 40;
      const treeY = windowY + windowHeight/2 + 40;
      
      // Each tree has a slightly different green
      const greenValue = 120 + Math.floor(Math.random() * 40);
      this.ctx.fillStyle = `rgb(40, ${greenValue}, 60)`;
      
      // Tree shape
      this.ctx.beginPath();
      this.ctx.moveTo(treeX, treeY);
      this.ctx.lineTo(treeX - treeWidth/2, treeY + treeHeight);
      this.ctx.lineTo(treeX + treeWidth/2, treeY + treeHeight);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Simple cloud
    const cloudX = windowX + 30 + (Date.now() * 0.005) % (windowWidth * 2) - windowWidth;
    const cloudY = windowY + 40;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(cloudX, cloudY, 15, 0, Math.PI * 2);
    this.ctx.arc(cloudX + 15, cloudY - 10, 15, 0, Math.PI * 2);
    this.ctx.arc(cloudX + 30, cloudY, 15, 0, Math.PI * 2);
    this.ctx.arc(cloudX + 15, cloudY + 5, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add slight reflection/light effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.beginPath();
    this.ctx.moveTo(windowX, windowY);
    this.ctx.lineTo(windowX + windowWidth, windowY);
    this.ctx.lineTo(windowX, windowY + windowHeight);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw curtain to the side
    const curtainWidth = 40;
    const curtainGradient = this.ctx.createLinearGradient(windowX - 15, 0, windowX - 15 + curtainWidth, 0);
    curtainGradient.addColorStop(0, '#9e2b25');
    curtainGradient.addColorStop(1, '#6b1d19');
    
    this.ctx.fillStyle = curtainGradient;
    
    // Draw wavy curtain edge
    this.ctx.beginPath();
    this.ctx.moveTo(windowX - 15, windowY - 15);
    
    for (let y = 0; y <= windowHeight + 30; y += 10) {
      const waveDepth = 5 + Math.sin(y * 0.1) * 3;
      this.ctx.lineTo(windowX - 15 + curtainWidth - waveDepth, windowY - 15 + y);
    }
    
    this.ctx.lineTo(windowX - 15, windowY + windowHeight + 15);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Curtain shadows and details
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    
    for (let y = 0; y <= windowHeight; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(windowX - 15, windowY - 15 + y);
      this.ctx.lineTo(windowX - 15 + curtainWidth - 5 - Math.sin(y * 0.1) * 3, windowY - 15 + y);
      this.ctx.lineTo(windowX - 15 + curtainWidth - 5 - Math.sin((y + 5) * 0.1) * 3, windowY - 15 + y + 5);
      this.ctx.lineTo(windowX - 15, windowY - 15 + y + 5);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  drawParticles() {
    for (const p of this.particles) {
      this.ctx.save();
      
      switch (p.type) {
        case 'sunbeam':
          // Draw sunbeam ray
          this.ctx.globalAlpha = p.currentOpacity || p.opacity;
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.angle);
          
          // Create a gradient for the sunbeam
          const beamGradient = this.ctx.createLinearGradient(0, 0, 0, p.height);
          beamGradient.addColorStop(0, 'rgba(255, 243, 201, 0.2)');
          beamGradient.addColorStop(1, 'rgba(255, 243, 201, 0)');
          
          this.ctx.fillStyle = beamGradient;
          this.ctx.fillRect(0, 0, p.width, p.height);
          break;
          
        case 'dust':
          // Draw dust particle in sunbeam
          this.ctx.globalAlpha = p.opacity * (Math.sin(p.age * 0.01) * 0.25 + 0.75); // Subtle fade in/out
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          
          this.ctx.fillStyle = 'rgba(255, 255, 240, 0.8)';
          this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          break;
          
        case 'ambient':
          // Draw ambient particle (very subtle)
          this.ctx.globalAlpha = p.opacity;
          this.ctx.translate(p.x, p.y);
          
          this.ctx.fillStyle = 'rgba(240, 240, 240, 0.4)';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case 'ripple':
          // Draw expanding ripple effect
          this.ctx.globalAlpha = p.opacity;
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = 2;
          
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
          
        case 'sparkle':
          // Draw sparkle particle
          this.ctx.globalAlpha = p.opacity;
          this.ctx.translate(p.x, p.y);
          
          // Draw a small star shape
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x1 = Math.cos(angle) * p.size;
            const y1 = Math.sin(angle) * p.size;
            const x2 = Math.cos(angle + Math.PI/5) * (p.size/2);
            const y2 = Math.sin(angle + Math.PI/5) * (p.size/2);
            
            if (i === 0) {
              this.ctx.moveTo(x1, y1);
            } else {
              this.ctx.lineTo(x1, y1);
            }
            this.ctx.lineTo(x2, y2);
          }
          this.ctx.closePath();
          this.ctx.fill();
          break;
          
        default:
          // Legacy particles
          this.ctx.globalAlpha = p.opacity;
          this.ctx.translate(p.x, p.y);
          if (p.rotation) this.ctx.rotate(p.rotation);
          
          this.ctx.fillStyle = p.color || '#ffffff';
          this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      }
      
      this.ctx.restore();
    }
  }
  
  // Resize handling
  resize(width, height) {
    // Clear current shelves and particles
    this.shelves = [];
    this.particles = [];
    
    // Reinitialize with new dimensions
    this.initShelves();
    this.initParticles();
  }
}

const BookshelfScene = ({ books = [] }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const libraryRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Initialize canvas and library scene
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      setCanvasSize({ width, height });
      
      // Resize library if it exists
      if (libraryRef.current) {
        libraryRef.current.resize(width, height);
      }
    };
    
    // Initial size
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Create library and start animation when canvas size is set and books are loaded
  useEffect(() => {
    if (canvasSize.width === 0 || books.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Create library scene
    libraryRef.current = new Library(canvas, books);
    setIsLoading(false);
    
    // Start animation loop
    let animationFrameId;
    
    const render = () => {
      if (libraryRef.current) {
        libraryRef.current.update();
        libraryRef.current.draw();
      }
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    // Mouse event handlers
    const handleMouseMove = (e) => {
      if (!libraryRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      libraryRef.current.handleMouseMove(x, y);
    };
    
    const handleClick = (e) => {
      if (!libraryRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedBook = libraryRef.current.handleClick(x, y);
      if (clickedBook) {
        setSelectedBook(clickedBook);
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    // Clean up
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [canvasSize, books]);
  
  // Handle book selection close
  const handleCloseBookInfo = () => {
    setSelectedBook(null);
    
    // Deselect all books in library
    if (libraryRef.current) {
      libraryRef.current.shelves.forEach(shelf => {
        shelf.deselectAllBooks();
      });
    }
  };
  
  // Handle book action (borrow or reserve)
  const handleBookAction = () => {
    alert(selectedBook.AvailableCopies > 0 
      ? `You have borrowed "${selectedBook.Title}"` 
      : `You have reserved "${selectedBook.Title}"`
    );
    handleCloseBookInfo();
  };
  
  return (
    <BookshelfContainer ref={containerRef}>
      {isLoading ? (
        <Loading>Creating your bookshelf experience</Loading>
      ) : (
        <CanvasContainer>
          <canvas 
            ref={canvasRef} 
            width={canvasSize.width} 
            height={canvasSize.height}
          />
        </CanvasContainer>
      )}
      
      {/* Book details panel */}
      {selectedBook && (
        <BookInfoPanel 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <CloseButton onClick={handleCloseBookInfo}>×</CloseButton>
          
          <BookTitle>{selectedBook.Title}</BookTitle>
          <BookAuthor>by {selectedBook.AuthorFirstName} {selectedBook.AuthorLastName}</BookAuthor>
          
          <BookAvailability isAvailable={(selectedBook.AvailableCopies > 0).toString()}>
            <p>{selectedBook.AvailableCopies > 0 ? 'Available Now' : 'Currently Unavailable'}</p>
            <span>{selectedBook.AvailableCopies} of {selectedBook.TotalCopies} copies available</span>
          </BookAvailability>
          
          <BookDetail>
            <h3>About This Book</h3>
            <p>
              {selectedBook.Description || 
                'No description available for this book.'}
            </p>
          </BookDetail>
          
          <BookDetail>
            <h3>Details</h3>
            <p><strong>Genre:</strong> {selectedBook.Genre || 'Unknown'}</p>
            <p><strong>Publisher:</strong> {selectedBook.Publisher || 'Unknown'}</p>
            <p><strong>Published:</strong> {selectedBook.PublicationYear || 'Unknown'}</p>
            <p><strong>ISBN:</strong> {selectedBook.ISBN || 'N/A'}</p>
          </BookDetail>
          
          <ActionButton 
            isAvailable={(selectedBook.AvailableCopies > 0).toString()}
            onClick={handleBookAction}
          >
            {selectedBook.AvailableCopies > 0 ? 'Borrow This Book' : 'Reserve This Book'}
          </ActionButton>
        </BookInfoPanel>
      )}
    </BookshelfContainer>
  );
};

export default BookshelfScene;