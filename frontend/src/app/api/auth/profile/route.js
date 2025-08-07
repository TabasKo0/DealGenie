import { verifyToken } from '../../../utils/auth';
import db from '../../../db/db';
import cookie from 'cookie';
export async function GET(request) {
  return new Response(JSON.stringify({ user: 'John Doe' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
  });
}
export  async function POST(request, res) {
 
  const token =  request.cookies.getAll()[0].value
   console.log(token)

  if (!token) return new Response(JSON.stringify({ error: 'Invalid token' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })

  try {

    const userr = verifyToken(token);
    console.log(userr.username)
    
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(userr.username);
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    })
   
    
  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
