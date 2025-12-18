import React from 'react';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

export default function NotFoundTemplate() {
  return (
    <div className="404-template">
      <Header />
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <a href="/" className="home-link">
          Return to Homepage
        </a>
      </div>
      <Footer />
    </div>
  );
}
