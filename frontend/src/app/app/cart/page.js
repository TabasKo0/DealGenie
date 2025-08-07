'use client';
import { useEffect, useState } from 'react';

const username = 'demo'; // Replace with actual auth

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(null);

  async function fetchCart() {
    const res = await fetch(`/api/cart/get?username=${username}`);
    const data = await res.json();
    setCart(data.cart || []);
  }

  async function fetchBalance() {
    const res = await fetch(`/api/get_balance?username=${username}`);
    const data = await res.json();
    setBalance(data.balance);
  }

  async function checkout() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (data.success) {
      alert('Checkout successful!');
      await fetchCart();
      setBalance(data.newBalance);
    } else {
      alert(data.error);
    }
  }

  useEffect(() => {
    fetchCart();
    fetchBalance();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {cart.map((item, i) => (
              <li key={i}>{item.name} - ₹{item.price}</li>
            ))}
          </ul>
          <button onClick={checkout} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Checkout
          </button>
        </>
      )}
      {balance !== null && <p className="mt-4">Balance: ₹{balance}</p>}
    </div>
  );
}
