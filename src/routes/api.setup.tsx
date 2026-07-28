import { createFileRoute } from '@tanstack/react-router'
import { createTables } from '~/db/schema'
import { seed } from '~/db/seed'

export const Route = createFileRoute('/api/setup')({
  loader: async () => {
    await createTables()
    const result = await seed()
    return {
      success: true,
      message: 'Database setup complete',
      ...result,
    }
  },
  component: SetupPage,
})

function SetupPage() {
  const data = Route.useLoaderData()
  return (
    <div className="min-h-screen bg-[#faf7f2] px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Database Setup
        </h1>
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-6">
          <pre className="text-sm text-green-800 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
