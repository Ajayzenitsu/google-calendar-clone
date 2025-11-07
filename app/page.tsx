import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  // Test database connection by querying events table
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('count')
    .limit(1)

  // Test profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

  const dbWorking = !eventsError && !profilesError

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            🗓️ Google Calendar Clone
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Built with Next.js 15 + Supabase + TypeScript
          </p>
        </div>

        {/* Connection Status */}
        <div className={`rounded-lg border p-4 ${
          dbWorking 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dbWorking ? '✅' : '⚠️'}</span>
            <div>
              <p className={`font-semibold ${
                dbWorking ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {dbWorking ? 'Database Connected!' : 'Database Setup Needed'}
              </p>
              <p className={`text-sm ${
                dbWorking ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {dbWorking 
                  ? 'All tables created successfully' 
                  : 'Please run the SQL schema in Supabase dashboard'}
              </p>
              {!dbWorking && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-yellow-800">Show errors</summary>
                  <pre className="mt-2 rounded bg-yellow-100 p-2 overflow-auto">
                    Events: {eventsError?.message || 'OK'}
                    {'\n'}
                    Profiles: {profilesError?.message || 'OK'}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>

        {/* User Status */}
        {user ? (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="font-semibold text-blue-900">👤 Logged in as:</p>
            <p className="text-sm text-blue-700">{user.email}</p>
            <Link
              href="/calendar"
              className="mt-4 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Go to Calendar →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Sign in to start managing your events
            </p>
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}

        {/* Setup Progress */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-4 font-semibold text-gray-900">Setup Progress:</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Next.js project created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Supabase connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={dbWorking ? "text-green-600" : "text-yellow-600"}>
                {dbWorking ? '✓' : '⏳'}
              </span>
              <span className="text-gray-700">Database schema</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-600">⏳</span>
              <span className="text-gray-700">Building calendar UI (next step)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
