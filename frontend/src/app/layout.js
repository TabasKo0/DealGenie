"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from 'react';
import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import Loading from './loading.js'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <html lang="en">
      
      <body
       
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <div className="loading"style={{ display: !load ? 'block' : 'none' }}>
          <Loading/>
        </div>
        <div className="body"
         style={{  display: load ? 'block' : 'none' }}>
        <Toaster />
        {children}
        </div>
      </body>
    </html>
  );
}
