import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const allowedPaths = [
  '', 
  '/app/home',
  '/app/livepoker',
  '/app/baccarat',
  '/app/soccer',
  '/app/tennis',
  '/app/tips',
  '/app/cricket',
  '/app/virtualsports'
];

export async function middleware(req) {
  const token = req.cookies.get('token');
  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);
  
  // Extract the path from the URL
  const urlParts = req.url.split('/');
  const path = urlParts.length === 5 
    ? '/' + urlParts[3] + '/' + urlParts[4] 
    : urlParts[3] || '';

  // If user has a token and is on the root path, redirect to home
  if (!path && token) {
    try {
      await jwtVerify(token.value, secretKey);
      return NextResponse.redirect(new URL('/app/home', req.url));
    } catch (error) {
      // Token is invalid, continue to login page
      console.error('Invalid token:', error.message);
    }
  }

  // Check if the path requires authentication
  if (!allowedPaths.includes(path)) {
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      await jwtVerify(token.value, secretKey);
      
      if (!path) {
        return NextResponse.redirect(new URL('/app/home', req.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/'],
};
