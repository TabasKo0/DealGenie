"use client"

import Image from "next/image";
import { toast,Toaster } from 'react-hot-toast';
import { useState } from 'react';
import Orb from './Orb/orb.js';


export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    toast.loading('Waiting...');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username:username, password: password }),
    });

    const data = await res.json();
    toast.dismiss()
    console.log(data)
    try{
      data=='User Created' ? toast.success('User created successfully') : toast.error('User Exists');
    }
    catch(e){toast.error(e)}
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    toast.loading('Waiting...');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username:username, password: password }),
    });

    

    const data = await res.json();
    toast.dismiss()
    if (data.message=='Login successful'){
       localStorage.setItem('user', JSON.stringify(username));
      toast.success('Login successful');
      window.location.href = '/app/home'
    }
    else{
      toast.error(data.message);
  };}

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] relative"
      style={{ overflowX: 'hidden', overflowY: 'hidden' }}
    >
      <div style={{ width: '100%', height: '800px', position: 'absolute', zIndex: 0 }}>
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={70}
          forceHoverState={false}
        />
      </div>

      <main className="flex flex-col gap-8 items-center justify-center" style={{ zIndex: 1, position: 'relative', borderRadius: '50%', height: '80vh', width: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <img
          src="/logo.png"
          alt="Next.js logo"
          style={{ width: '45vh', height: 'auto', borderRadius: '20px', display: 'block', margin: '0 auto' }}
          priorty="true"
        />
        <ol className="list-inside list-decimal text-sm text-center font-[family-name:var(--font-geist-mono)] flex flex-col items-center justify-center">
          {/* ...existing code... */}
        </ol>

        <div className="flex flex-col items-center justify-center w-full">
          <form className="flex flex-col gap-4 items-center justify-center w-full">
            <input
              type="text"
              style={{ color: 'black', borderRadius: '12px', width: '320px' }}
              className="rounded border border-solid border-gray-300 p-2 mb-4 text-center"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              style={{ color: 'black', borderRadius: '12px', width: '320px' }}
              className="rounded border border-solid border-gray-300 p-2 mb-4 text-center"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleLogin}
                style={{ color: 'black', borderRadius: '999px', minWidth: '120px' }}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                🙏
                Login
              </button>
              <button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                style={{ borderRadius: '999px', minWidth: '120px' }}
                onClick={handleSignup}
              >
                👋Signup
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
