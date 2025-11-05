import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
 
export async function middleware(request: NextRequest) {
  const {pathname}=request.nextUrl
    const token=request.cookies.get('token')

    if(pathname==='/'){
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (!token) {
        console.log("unauthorized");
        return NextResponse.redirect(new URL('/login', request.url));
    }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/canva' || pathname.startsWith('/canva/')) {
    return NextResponse.next();
  }
}
 
export const config = {
  matcher: [
    '/dashboard',
    '/canva/:path*',
    '/'
  ],
}