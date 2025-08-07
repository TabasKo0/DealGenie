"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./../globals.css";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Loading from './loading'
import { Suspense } from 'react'
import Cookies from 'js-cookie';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setActiveLink(router.pathname);
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
    }, [router.pathname]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLinkClick = (href) => {
        setActiveLink(href);
        setTimeout(() => {setActiveLink('');}, 100);
        setMenuOpen(!menuOpen);
        router.push(href);
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ fontWeight:"bold",display: 'flex', marginBottom: '20px' }}>
                <img className="logo" src="/logo.png" alt="Logo" style={{ borderRadius:'1vh', marginRight: '10px' }} />
                <button style={{borderRadius:'0.5vh'}} className="hamburger-menu" onClick={toggleMenu}>
                    <span className="hamburger-icon"></span>
                </button>
            
                <nav className={` navbar ${menuOpen ? 'open' : ''}`} style={{ alignItems: 'center', width: '100%', padding: '1px', justifyContent: 'center' }}>
                    <div className="menu-wrap">
                        <div className="full-wrap">
                            <ul className="tab-menu flex list-none p-1">
                                <li className={` first ver-menu ${activeLink === '/app/home' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/home')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                                    </svg>Home</a>
                                </li>
                                <li className={`hidden ver-menu ${activeLink === '/inplay' ? 'active' : ''}`} onClick={() => handleLinkClick('/ch')}>
                                    <a className="navbar-item hover:underline">Phones</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/roulette' ? 'active' : ''} ${isLoggedIn ? '':'hidden'}`} onClick={() => handleLinkClick('/app/roulette')}>
                                    <a className="navbar-item hover:underline">Phones</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/cricket' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/ch')}>
                                    <a className="navbar-item hover:underline">Headphones</a>
                                </li>
                               
                               
                                <li className={`last ver-menu ${activeLink === '/app/profile' ? 'active' : ''}`} >
                                    {isLoggedIn ? (
                                        <a className="navbar-item hover:underline" onClick={() => handleLinkClick('/app/profile')}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path  d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>Profile</a>
                                    ) : (
                                        <a className="navbar-item hover:underline" onClick={() => handleLinkClick('/')}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path  d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>Login</a>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <div style={{borderRadius:'2vh', boxShadow:" 0 0 20px 3px #d2ffcdff", width: '100%', backgroundColor: '#f0f0f0', padding: '10px' }}>
                    <Suspense fallback={<Loading/>}>
                        {children}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
