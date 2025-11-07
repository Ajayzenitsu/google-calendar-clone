import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch todos
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  async function addTodo(formData: FormData) {
    'use server'
    
    const task = formData.get('task') as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('todos').insert({
      task,
      user_id: user.id,
    })

    redirect('/protected')
  }

  async function toggleTodo(formData: FormData) {
    'use server'
    
    const id = formData.get('id') as string
    const isComplete = formData.get('isComplete') === 'true'
    const supabase = await createClient()

    await supabase
      .from('todos')
      .update({ is_complete: !isComplete })
      .eq('id', id)

    redirect('/protected')
  }

  async function signOut() {
    'use server'
    
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Todos</h1>
          <form action={signOut}>
            <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
              Sign Out
            </button>
          </form>
        </div>

        <form action={addTodo} className="mb-8 flex gap-2">
          <input
            type="text"
            name="task"
            placeholder="Add a new todo..."
            required
            className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        <div className="space-y-2">
          {todos?.map((todo) => (
            <form key={todo.id} action={toggleTodo} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow">
              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="isComplete" value={String(todo.is_complete)} />
              <button
                type="submit"
                className={`h-5 w-5 rounded border-2 ${
                  todo.is_complete ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              />
              <span className={todo.is_complete ? 'line-through text-gray-500' : ''}>
                {todo.task}
              </span>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
