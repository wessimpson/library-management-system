import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #1E5F74;
    --primary-dark: #133B49;
    --primary-light: #68BBD5;
    --secondary-color: #2D3B55;
    --secondary-light: #6E7891;
    --text-color: #2C3E50;
    --text-light: #6C7A89;
    --background-color: #F9FBFD;
    --card-color: #FFF;
    --accent-color: #F7567C;
    --accent-light: #FF99AF;
    --success-color: #34c759;
    --error-color: #ff3b30;
    --warning-color: #ffcc00;
    --transition-speed: 0.3s;
    --box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    --border-radius: 12px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.7;
    letter-spacing: 0.01em;
    min-height: 100vh;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', Georgia, serif;
    color: var(--primary-color);
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    font-weight: 600;
    line-height: 1.3;
  }

  h1 {
    font-size: 3rem;
  }

  h2 {
    font-size: 2.5rem;
  }

  h3 {
    font-size: 2rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  p {
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: all var(--transition-speed) ease;
  }

  a:hover {
    color: var(--accent-color);
  }

  button, input, select, textarea {
    font-family: 'Inter', 'Roboto', sans-serif;
    font-size: 1rem;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(30, 95, 116, 0.4);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(30, 95, 116, 0.6);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-1 {
    gap: 0.25rem;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-3 {
    gap: 1rem;
  }

  .gap-4 {
    gap: 1.5rem;
  }

  .my-1 {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .my-2 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .my-3 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .my-4 {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .p-1 {
    padding: 0.25rem;
  }

  .p-2 {
    padding: 0.5rem;
  }

  .p-3 {
    padding: 1rem;
  }

  .p-4 {
    padding: 1.5rem;
  }

  .hidden {
    display: none;
  }

  .w-full {
    width: 100%;
  }

  .h-full {
    height: 100%;
  }

  .rounded {
    border-radius: var(--border-radius);
  }

  .shadow {
    box-shadow: var(--box-shadow);
  }
`;

export default GlobalStyles;