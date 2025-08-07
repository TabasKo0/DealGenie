import { signup } from '@/app/actions/auth'
 
export function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)
  return (
    <form action={signup}>
      
    
       <main className="flex flex-col gap-8 items-center">
              <Image
                src="/logo.png"
                alt="Next.js logo"
                width={1000}
                height={250}
                style={{ width: '50%', height: 'auto' }}
                priority
              />
              <ol className="list-inside list-decimal text-sm text-center font-[family-name:var(--font-geist-mono)]">
      
              </ol>
      
              <div className="flex flex-col gap-4 items-center">
                <input
                  type="text"
                 
                  id="name" name="name" placeholder="Name" 
                  className="rounded border border-solid border-gray-300 p-2 mb-4"
                />
                 <input
                  type="text"
                 
                  id="name" name="name" placeholder="Name" 
                  className="rounded border border-solid border-gray-300 p-2 mb-4"
                />
                <input
                  type="password"
                   id="password" name="password" placeholder="Password"
                  className="rounded border border-solid border-gray-300 p-2 mb-4"
                />
                <div className="flex gap-4">
                  <a
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                    href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      className="dark:invert"
                      src="/vercel.svg"
                      alt="Vercel logomark"
                      width={20}
                      height={20}
                    />
                    Login
                  </a>
                  <button type="submit"><a
                    className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                    
                    rel="noopener noreferrer"
                  >
                    Login With Demo Id
                  </a>
                  </button>
                </div>
              </div>
            </main>
    </form>
  )
}