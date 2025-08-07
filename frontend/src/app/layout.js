"use client";

import "./globals.css";
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Loading from './loading.js';

export default function RootLayout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div 
          className="loading" 
          style={{ display: !isLoaded ? 'block' : 'none' }}
        >
          <Loading />
        </div>
        <div 
          className="body"
          style={{ display: isLoaded ? 'block' : 'none' }}
        >
          <Toaster />
          {children}
        </div>
      </body>
    </html>
  );
}
