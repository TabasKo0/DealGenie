import db from '@/lib/db';
import { getCart, clearCart } from '@/lib/cartDb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  const cart = getCart(username);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.balance < total) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  const newBalance = user.balance - total;
  const transactions = JSON.stringify([
    ...(JSON.parse(user.transactions || '[]')),
    {
      type: 'purchase',
      amount: total,
      timestamp: new Date().toISOString(),
      items: cart
    }
  ]);

  db.prepare(`UPDATE users SET balance = ?, transactions = ? WHERE username = ?`)
    .run(newBalance, transactions, username);

  clearCart(username);

  return NextResponse.json({ success: true, newBalance });
}
