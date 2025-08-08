import  db  from '../../../db/db';

export async function POST(req) {
  const body = await req.json();
  console.log('Received request body:', body);

  const { username } = body;

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stmt = db.prepare(`SELECT * FROM carts WHERE username = ?`);
  const cartItems = stmt.all(username);

  return new Response(JSON.stringify({ cart: cartItems }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
