import { NextResponse } from 'next/server';
import { getCart } from '../../../db/cartDb';

export async function GET(req) {
  const username = new URL(req.url).searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  const cart = getCart(username);
  return NextResponse.json({ cart });
}
