import { NextResponse } from 'next/server';
import { addToCart } from '../../../db/cartDb';

export async function POST(req) {
  try {
    const { username, item,price } = await req.json();
console.log('Received data:', { username, item ,price});
  
    addToCart(username, item,price);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
