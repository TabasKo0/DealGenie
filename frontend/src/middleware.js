import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
const allowedsites=['', '/app/home','/app/livepoker','/app/baccarat','/app/soccer','/app/tennis','/app/tips','/app/cricket','/app/virtualsports']
export async function middleware(req) {
    const token = req.cookies.get('token');
    const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);
    let url=req.url.split('/')
    url=(url.length)==5?'/'+req.url.split('/')[3]+'/'+req.url.split('/')[4]:req.url.split('/')[3]
    console.log(url)
    if (!url&&token){

        try {
            
            await jwtVerify(token.value, secretKey);
           
                return NextResponse.redirect(new URL('/app/home', req.url));
           
        } catch (error) {
          //  console.log(error);
        }
    
    
    }
    if (allowedsites.indexOf(url)==-1)
        {
            if (!token) {
      //  console.log('1')
       return NextResponse.redirect(new URL('/', req.url));
        
    }

    try {
       
        await jwtVerify(token.value, secretKey);
        if (!url)
            return NextResponse.redirect(new URL('/app/home', req.url));
        return NextResponse.next();
    } catch (error) {
      //  console.log(error);
       return NextResponse.redirect(new URL('/', req.url));
    }}
}

export const config = {
    matcher: ['/app/:path*','/'],
};
