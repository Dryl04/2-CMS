import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from login
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Handle redirects for public pages (not admin or api routes)
  if (!request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/_next') &&
      request.nextUrl.pathname !== '/login') {
    
    // Extract the path without leading slash
    const path = request.nextUrl.pathname.slice(1);
    
    if (path) {
      // Check if there's a redirect for this path
      const { data: redirect } = await supabase
        .from('redirects')
        .select('destination_path, redirect_type, hit_count')
        .eq('source_path', path)
        .eq('is_active', true)
        .single();

      if (redirect) {
        // Increment hit counter (fire and forget - don't await)
        void supabase
          .from('redirects')
          .update({ hit_count: (redirect.hit_count || 0) + 1 })
          .eq('source_path', path);

        // Perform redirect
        const destination = new URL(`/${redirect.destination_path}`, request.url);
        return NextResponse.redirect(destination, redirect.redirect_type);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/login',
    // Match all paths except _next/static, _next/image, favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
