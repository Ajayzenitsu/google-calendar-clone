import { createClient } from '@/lib/supabase/server'  // ✅ Use @/lib not @/utils
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 1. Get the URL parameters from the verification email link
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')  // The verification code from email
  const next = searchParams.get('next') ?? '/'  // Where to redirect after success

  if (code) {
    // 2. Exchange the code for an actual user session
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 3. Success! Redirect user to the calendar (or specified page)
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // 4. If something went wrong, redirect to error page
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
