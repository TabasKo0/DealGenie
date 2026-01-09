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
                <img className="logo" src="/loo.png" alt="Logo" style={{ borderRadius:'1vh', marginRight: '10px' }} />
                <button style={{borderRadius:'0.5vh'}} className="hamburger-menu" onClick={toggleMenu}>
                    <span className="hamburger-icon"></span>
                </button>
            
                <nav className={` navbar ${menuOpen ? 'open' : ''}`} style={{ alignItems: 'center', width: '100%', padding: '1px', justifyContent: 'center' }}>
                    <div className="menu-wrap">
                        <div className="full-wrap">
                            <ul className="tab-menu flex list-none p-1">
                                <li className={` first ver-menu ${activeLink === '/app/home' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/home')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path d="M3.012 10.981 3 11h2v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9h2a1 1 0 0 0 .555-1.832l-9-6a1 1 0 0 0-1.11 0l-9 6a1 1 0 0 0-.277 1.387.98.98 0 0 0 .844.426zM10 14a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h-4z"/>
</svg>
</a>
                                </li>
                                <li className={`hidden ver-menu ${activeLink === '/inplay' ? 'active' : ''}`} onClick={() => handleLinkClick('/ch')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48" fill="black">
  <path d="M304.576 119.703h-97.148c-18.358 0-33.247 11.434-33.247 25.54v221.509c0 14.106 14.89 25.545 33.247 25.545h97.148c18.359 0 33.243-11.44 33.243-25.545V145.243c0-14.111-14.884-25.54-33.243-25.54zm-73.68 13.752h50.213v14.115h-50.213zm42.132 242.629h-34.05v-14.116h34.05zm44.025-31.51H194.947V163.39h122.106z"/>
</svg>


</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/phone' ? 'active' : ''} ${isLoggedIn ? '':'hidden'}`} onClick={() => handleLinkClick('/app/phone')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48" fill="black">
  <path d="M304.576 119.703h-97.148c-18.358 0-33.247 11.434-33.247 25.54v221.509c0 14.106 14.89 25.545 33.247 25.545h97.148c18.359 0 33.243-11.44 33.243-25.545V145.243c0-14.111-14.884-25.54-33.243-25.54zm-73.68 13.752h50.213v14.115h-50.213zm42.132 242.629h-34.05v-14.116h34.05zm44.025-31.51H194.947V163.39h122.106z"/>
</svg>

</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/cricket' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/headphone')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="24" height="24" fill="black">
  <path d="M122.229 76.7l-4.223-1.356v-6.16a53.775 53.775 0 0 0-13.638-35.823 1.724 1.724 0 0 0-.253-.33c-.035-.034-.075-.059-.111-.09a53.926 53.926 0 0 0-80.008 0c-.036.031-.076.056-.111.09a1.724 1.724 0 0 0-.253.33A53.775 53.775 0 0 0 9.994 69.184v6.158L5.771 76.7a1.75 1.75 0 0 0-1.214 1.666v24.219a1.75 1.75 0 0 0 1.214 1.666l9.66 3.1v3.721a1.751 1.751 0 0 0 1.75 1.75h11.325a7.759 7.759 0 0 0 7.75-7.75v-29.2a7.759 7.759 0 0 0-7.75-7.75H17.181a1.75 1.75 0 0 0-1.75 1.75v3.719l-1.937.623v-5.03a50.27 50.27 0 0 1 11.739-32.33l.308.307a7.7 7.7 0 0 0 5.465 2.252 7.8 7.8 0 0 0 5.159-1.943 42.2 42.2 0 0 1 55.669 0 7.787 7.787 0 0 0 10.625-.309l.308-.307a50.27 50.27 0 0 1 11.739 32.33v5.033l-1.937-.623v-3.719a1.75 1.75 0 0 0-1.75-1.75H99.494a7.759 7.759 0 0 0-7.75 7.75v29.2a7.759 7.759 0 0 0 7.75 7.75h11.325a1.751 1.751 0 0 0 1.75-1.75v-3.721l9.66-3.1a1.75 1.75 0 0 0 1.214-1.666V78.364a1.75 1.75 0 0 0-1.214-1.664z"/>
  <path d="M84.085 88.724h-8.2a1.749 1.749 0 0 0-1.685 1.265l-4.26 14.768L59.741 69.39a1.75 1.75 0 0 0-3.363 0L50.8 88.724h-6.885a1.75 1.75 0 0 0 0 3.5h8.2a1.75 1.75 0 0 0 1.685-1.266l4.26-14.768 10.2 35.367a1.75 1.75 0 0 0 3.363 0L77.2 92.224h6.887a1.75 1.75 0 0 0 0-3.5z"/>
</svg>

</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/cricket' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/laptop')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="24" height="24">
  <path fill="black" d="M110.8 87.514v-55.86a1.75 1.75 0 0 0-1.75-1.75h-90.1a1.75 1.75 0 0 0-1.75 1.75v55.86a1.75 1.75 0 0 0 1.75 1.75h90.1a1.75 1.75 0 0 0 1.75-1.75zm-3.5-1.75H20.7V33.4h86.6z"/>
  <path fill="black" d="M121.693 92.487h-4.168V29.434a6.258 6.258 0 0 0-6.252-6.252H16.727a6.258 6.258 0 0 0-6.252 6.252v63.053H6.307a1.751 1.751 0 0 0-1.75 1.75v4.331a6.257 6.257 0 0 0 6.25 6.25h106.386a6.256 6.256 0 0 0 6.25-6.25v-4.331a1.75 1.75 0 0 0-1.75-1.75zM13.975 29.434a2.754 2.754 0 0 1 2.752-2.752h94.546a2.754 2.754 0 0 1 2.752 2.752v63.053H77.144a1.75 1.75 0 0 0-1.75 1.75v.935H52.606v-.935a1.751 1.751 0 0 0-1.75-1.75H13.975zm105.968 69.134a2.753 2.753 0 0 1-2.75 2.75H10.807a2.754 2.754 0 0 1-2.75-2.75v-2.581h41.049v.935a1.75 1.75 0 0 0 1.75 1.75h26.288a1.75 1.75 0 0 0 1.75-1.75v-.935h41.049z"/>
</svg>

</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/cricket' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/speaker')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
  <path d="M18 0H6a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm1 21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"/>
  <path d="M12 11a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zM12 9a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
  <path d="M12 15a1 1 0 0 0 0 2 1 1 0 0 0 0-2z"/>
</svg>

</a>
                                </li>
                                <li className={`ver-menu ${activeLink === '/app/cricket' ? 'active' : ''}`} onClick={() => handleLinkClick('/app/watch')}>
                                    <a className="navbar-item hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48" fill="black">
  <g data-name="Smart Watch">
    <path d="m313.7 162.786-7.678-95.236H203.286l-7.687 95.414a41.906 41.906 0 0 0-30.13 40.16v109.81a41.901 41.901 0 0 0 30.233 40.184l7.621 91.332h102.662l7.612-91.145a41.9 41.9 0 0 0 30.935-40.37V203.13a41.899 41.899 0 0 0-30.832-40.343zM221.84 87.66h65.628l5.855 72.657h-77.337zm-.019 336.68-5.798-69.538h77.263l-5.798 69.538zm102.605-111.405a21.779 21.779 0 0 1-19.254 21.602H204.838a21.78 21.78 0 0 1-19.264-21.602V203.129a21.777 21.777 0 0 1 21.752-21.752h95.358a21.767 21.767 0 0 1 21.742 21.751z"/>
    <path d="M198.723 321.711h112.555V194.347H198.723zm20.106-107.253h72.343V301.6h-72.343z"/>
  </g>
</svg>

</a>
                                </li>

                               
                               
                                <li className={`last ver-menu ${activeLink === '/app/profile' ? 'active' : ''}`} >
                                    {isLoggedIn ? (
                                        <a className="navbar-item hover:underline" onClick={() => handleLinkClick('/app/profile')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
  <path d="M16 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM27 32a1 1 0 0 1-1-1v-6.115a6.95 6.95 0 0 0-6.942-6.943h-6.116A6.95 6.95 0 0 0 6 24.885V31a1 1 0 1 1-2 0v-6.115c0-4.93 4.012-8.943 8.942-8.943h6.116c4.93 0 8.942 4.012 8.942 8.943V31a1 1 0 0 1-1 1z"/>
</svg>
</a>
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
                <div style={{borderRadius:'2vh', boxShadow:" 0 0 20px 3px #ffffffff", width: '100%', backgroundColor: '#ffffffff', padding: '10px' }}>
                    <Suspense fallback={<Loading/>}>
                        {children}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}