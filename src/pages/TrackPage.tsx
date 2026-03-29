import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiSearch, FiPackage } from 'react-icons/fi'
import { TrackingTimeline } from '../components/TrackingTimeline'
import type { TrackingResult } from '../components/TrackingTimeline'
import { api } from '../api/client'

export const TrackPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlNumber = searchParams.get('number') || ''

  const [input, setInput] = useState(urlNumber)
  const [trackingNumber, setTrackingNumber] = useState(urlNumber)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doQuery = async (number: string) => {
    if (!number.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setTrackingNumber(number.trim())
    try {
      const data = await api.queryTracking(number.trim())
      setResult(data)
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError(t('tracking.rateLimited'))
      } else {
        setError(err.message || t('tracking.fetchError'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (urlNumber) {
      doQuery(urlNumber)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setSearchParams({ number: input.trim() })
    doQuery(input.trim())
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <FiPackage className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('tracking.pageTitle')}</h1>
          <p className="text-gray-500">{t('tracking.pageSubtitle')}</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tracking.inputPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSearch size={16} />
              {t('tracking.search')}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p className="text-sm text-gray-500">{t('tracking.querying')}</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <TrackingTimeline
            trackingNumber={trackingNumber}
            data={result}
            defaultExpanded
          />
        )}

        {/* Empty state (no search yet) */}
        {!result && !loading && !error && !urlNumber && (
          <div className="text-center py-12 text-gray-400">
            <FiSearch size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tracking.emptyHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
