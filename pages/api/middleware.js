import {NextResponse} from 'next/server';

import { verifyJwtToken } from '@/lib/authenticate';

// List of safe routes
const AUTH_PAGES = ['/api/user/login', '/api/user/register'];

const isAuthPages = (url) => AUTH_PAGES.some((page) => page.startsWith(url));

// Authorization + authentication middleware
export async function middleware(req) {
  const {url, nextUrl, cookies} = req;
  const {value: token} = cookies.get("token") ?? {value: null};
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
  // if it is a restricted page and they don't have a valid token, reject the request
  else if (!hasVerifiedToken) {
    const response = NextResponse.redirect(
      new URL('/login', url)
    );
    return response;
  }
}

// Restrict middleware behaviour
export const config = {
  matcher: ['/api/:path*']
}

// TODO: verify that this middleware is correctly protecting API routes