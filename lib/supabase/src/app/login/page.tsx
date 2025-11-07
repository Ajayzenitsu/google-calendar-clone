import { createClient } from '@/lib/supabase/server'  // ✅ Use @/lib not @/utils
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already logged in, don't show login form
  if (user) {
    return redirect('/calendar')  // ✅ Redirect to calendar instead of /protected
  }

  // ═══════════════════════════════════════════════════════
  // SERVER ACTION: Sign In
  // ═══════════════════════════════════════════════════════
  async function signIn(formData: FormData) {
    'use server'  // This marks it as a server-side function
    
    // 1. Get email and password from the form
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    // 2. Try to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 3. If wrong credentials, show error
    if (error) {
      return redirect('/login?message=Invalid credentials')
    }

    // 4. Success! Go to calendar
    return redirect('/calendar')  // ✅ Changed from /protected
  }

  // ═══════════════════════════════════════════════════════
  // SERVER ACTION: Sign Up
  // ═══════════════════════════════════════════════════════
  async function signUp(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    // Sign up the user and send verification email
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // After clicking email link, redirect to callback route
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return redirect('/login?message=Error signing up')
    }

    // Tell user to check their email
    return redirect('/login?message=Check email to confirm')
  }

  // ═══════════════════════════════════════════════════════
  // THE FORM UI
  // ═══════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <h2 className="text-center text-3xl font-bold">Sign In</h2>
        
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Two Buttons - One Form! */}
          <div className="flex gap-4">
            {/* This button calls signIn function */}
            <button
              formAction={signIn}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Sign In
            </button>
            
            {/* This button calls signUp function */}
            <button
              formAction={signUp}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
