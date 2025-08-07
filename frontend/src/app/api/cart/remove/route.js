import { NextResponse } from 'next/server';
import { removeFromCart } from '../../../db/cartDb';

export async function POST(req) {
  const { username, productId } = await req.json();
  if (!username || !productId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  removeFromCart(username, productId);
  return NextResponse.json({ success: true });
}
