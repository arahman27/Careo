import {NextResponse} from 'next/server';

import { verifyJwtToken } from '@/lib/authenticate';

// List of safe routes
const AUTH_PAGES = ['/login', '/', '/sign-up', '/forgot', '/terms-and-conditions'];

const isAuthPages = (url) => AUTH_PAGES.some((page) => page.startsWith(url));

// Authorization + authentication middleware
export async function middleware(req) {
  const {url, nextUrl, cookies} = req;
  const {value: token} = cookies.get("token") ?? {value: null};
  if (nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/assets') || nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  const hasVerifiedToken = token && (await verifyJwtToken(token));
  
  // if is an unrestricted page
  if (isAuthPages(nextUrl.pathname)) {
    // If they don't have a token or it's an invalid token, delete the token
    if (!hasVerifiedToken) {
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
    // Otherwise let them continue
    const response = NextResponse.next();
    return response;
  }
  // if it is a restricted page and they don't have a valid token, redirect them to login
  else if (!hasVerifiedToken) {
    console.log("REDIRECTING");
    const response = NextResponse.redirect(
      new URL('/login', url)
    );
    return response;
  }
}

// If more client-side routes are added, add them here.
export const config = {
  matcher: ['/', '/login', '/sign-up', '/place-order', '/forgot', '/terms-and-conditions', '/create-profile', '/shopping-cart', '/recommendation', '/user-profile', '/compatibility']
}
