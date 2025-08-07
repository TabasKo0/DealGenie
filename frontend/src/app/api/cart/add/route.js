import { NextResponse } from 'next/server';
import { addToCart } from '../../../db/cartDb';

export async function POST(req) {
  const { username, item } = await req.json();
  if (!username || !item) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  addToCart(username, item);
  return NextResponse.json({ success: true });
}
