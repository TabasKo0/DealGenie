import db from '../../../db/db';
import { comparePassword, generateToken } from '../../../utils/auth';
import {serialize} from 'cookie';

export async function GET(request) {
  return new Response(JSON.stringify({ user: 'John Doe' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
  });
}


export  async function POST(request) {
 
  const {username,password} = await request.json()

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return new Response(JSON.stringify({ message: `No` }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  }) }

  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const headers = new Headers();
  headers.append('Set-Cookie', serialize('token', generateToken(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/',
  }));



  return new Response(JSON.stringify({ message: 'Login successful' }), {
    status: 200,
    headers: headers,
  });
}
