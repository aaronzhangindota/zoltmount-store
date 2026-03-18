import React, { useEffect } from 'react'
import { useDataStore } from '../store/dataStore'

export const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fetchAll = useDataStore((s) => s.fetchAll)
  const isLoading = useDataStore((s) => s.isLoading)
  const error = useDataStore((s) => s.error)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchAll()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
