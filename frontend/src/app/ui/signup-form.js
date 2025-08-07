import Image from 'next/image';

export function SignupForm() {
  return (
    <form>
      <main className="flex flex-col gap-8 items-center">
        <Image
          src="/logo.png"
          alt="DealGenie Logo"
          width={1000}
          height={250}
          style={{ width: '50%', height: 'auto' }}
          priority
        />
        
        <div className="flex flex-col gap-4 items-center">
          <input
            type="text"
            id="username" 
            name="username" 
            placeholder="Username" 
            className="rounded border border-solid border-gray-300 p-2 mb-4"
          />
          <input
            type="password"
            id="password" 
            name="password" 
            placeholder="Password"
            className="rounded border border-solid border-gray-300 p-2 mb-4"
          />
          <div className="flex gap-4">
            <button 
              type="submit"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>
    </form>
  );
}