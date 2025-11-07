import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════
// MIDDLEWARE FUNCTION (runs on EVERY page request)
// ═══════════════════════════════════════════════════════
export async function middleware(request: NextRequest) {
  // 1. Create a default "allow" response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create a Supabase client that can read/write cookies
  //    (cookies are how we remember logged-in users)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // How to READ a cookie from the browser
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        
        // How to SET a new cookie (when user logs in)
        set(name: string, value: string, options: CookieOptions) {
          // Update the request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Create fresh response with updated headers
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Also set the cookie in the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        
        // How to DELETE a cookie (when user logs out)
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',  // Empty value = deleted
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. Check if there's a logged-in user
  const { data: { user } } = await supabase.auth.getUser()

  // 4. PROTECTION RULE: Block non-logged-in users from /calendar
  if (!user && request.nextUrl.pathname.startsWith('/calendar')) {  // ✅ Changed from /protected
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. Allow the request to continue
  return response
}

// ═══════════════════════════════════════════════════════
// CONFIGURATION: Which routes this middleware applies to
// ═══════════════════════════════════════════════════════
export const config = {
  // Run on all routes EXCEPT:
  // - /_next/static (Next.js internal files)
  // - /_next/image (Next.js image optimization)
  // - /favicon.ico (the site icon)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
