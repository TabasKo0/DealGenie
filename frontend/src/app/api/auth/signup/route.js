import db from '../../../db/db';
import { hashPassword} from '../../../utils/auth';

export async function GET(request) {
  return new Response(JSON.stringify({ user: 'John Doe' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
  });
}


export  async function POST(request, res) {
  if (request.method !== 'POST') return res.status(405).end();

  const {username,password} = await request.json()

console.log(username)


  try {
    const hashedPassword = await hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (username, password,balance) VALUES (?, ?,100000)');
    stmt.run(username, hashedPassword);

    return new Response(JSON.stringify("User Created"), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      
    })
  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ message: err }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
  });
  }
}
