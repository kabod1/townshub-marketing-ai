'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-red-600 text-sm font-mono bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left break-all">
          {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p className="text-slate-400 text-xs mb-4">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
