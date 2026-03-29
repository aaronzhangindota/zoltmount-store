import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPackage, FiTruck, FiCheck, FiClock, FiAlertCircle, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi'

export interface TrackingEvent {
  time: string
  description: string
  location: string
}

export interface TrackingResult {
  number: string
  carrier: string
  status: number | null
  events: TrackingEvent[]
  lastEvent: string | null
  lastTime: string | null
}

// 17TRACK 状态码映射
// 0=未查到, 10=运输中, 20=到达待取, 30=投递失败, 35=待取中, 40=已签收, 50=可能异常, 60=退件
function getStatusInfo(status: number | null, t: (key: string) => string) {
  switch (status) {
    case 40:
      return { label: t('tracking.delivered'), color: 'text-green-600', bg: 'bg-green-100', Icon: FiCheck }
    case 10:
      return { label: t('tracking.inTransit'), color: 'text-blue-600', bg: 'bg-blue-100', Icon: FiTruck }
    case 20:
    case 35:
      return { label: t('tracking.awaitingPickup'), color: 'text-yellow-600', bg: 'bg-yellow-100', Icon: FiPackage }
    case 30:
      return { label: t('tracking.deliveryFailed'), color: 'text-red-600', bg: 'bg-red-100', Icon: FiAlertCircle }
    case 50:
      return { label: t('tracking.exception'), color: 'text-red-600', bg: 'bg-red-100', Icon: FiAlertCircle }
    case 60:
      return { label: t('tracking.returned'), color: 'text-orange-600', bg: 'bg-orange-100', Icon: FiAlertCircle }
    default:
      return { label: t('tracking.pending'), color: 'text-gray-500', bg: 'bg-gray-100', Icon: FiClock }
  }
}

interface TrackingTimelineProps {
  trackingNumber: string
  carrier?: string
  /** 从父组件传入追踪数据，避免重复请求 */
  data?: TrackingResult | null
  /** 未传入 data 时，使用此 fetcher 获取数据 */
  onFetch?: (number: string) => Promise<TrackingResult>
  /** 是否默认展开 */
  defaultExpanded?: boolean
  /** 紧凑模式（用于 AccountPage） */
  compact?: boolean
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  trackingNumber,
  carrier,
  data: externalData,
  onFetch,
  defaultExpanded = false,
  compact = false,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [trackData, setTrackData] = useState<TrackingResult | null>(externalData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (externalData) {
      setTrackData(externalData)
    }
  }, [externalData])

  const fetchData = async () => {
    if (trackData || !onFetch) return
    setLoading(true)
    setError(null)
    try {
      const result = await onFetch(trackingNumber)
      setTrackData(result)
    } catch (err: any) {
      setError(err.message || t('tracking.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!expanded && !trackData && onFetch) {
      fetchData()
    }
    setExpanded(!expanded)
  }

  const statusInfo = trackData ? getStatusInfo(trackData.status, t) : null
  const events = trackData?.events || []
  const displayEvents = expanded ? events : events.slice(0, 3)

  return (
    <div className={`rounded-lg border ${compact ? 'border-blue-100 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-opacity-80 transition-colors"
      >
        <FiTruck className="text-blue-600 shrink-0" size={compact ? 16 : 18} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">{carrier || trackData?.carrier || 'Carrier'}:</span>
            <span className="text-sm font-medium text-gray-900 break-all">{trackingNumber}</span>
          </div>
          {statusInfo && (
            <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium ${statusInfo.color}`}>
              <statusInfo.Icon size={12} />
              {statusInfo.label}
              {trackData?.lastTime && (
                <span className="text-gray-400 font-normal ml-1">
                  · {new Date(trackData.lastTime).toLocaleDateString()}
                </span>
              )}
            </span>
          )}
          {loading && (
            <span className="text-xs text-gray-400 mt-1 block">{t('common.loading')}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://www.17track.net/en/track#nums=${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:text-blue-700"
            title="17track.net"
          >
            <FiExternalLink size={14} />
          </a>
          {expanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Timeline */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          {error && (
            <p className="text-xs text-red-500 py-2">{error}</p>
          )}
          {!loading && events.length === 0 && !error && (
            <p className="text-xs text-gray-400 py-3 text-center">{t('tracking.noEvents')}</p>
          )}
          {displayEvents.length > 0 && (
            <div className="relative ml-3 mt-2">
              {/* 竖线 */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-200" />
              {displayEvents.map((evt, i) => (
                <div key={i} className="relative pl-5 pb-3 last:pb-0">
                  {/* 圆点 */}
                  <div className={`absolute left-[-3px] top-1.5 w-[7px] h-[7px] rounded-full border-2 ${
                    i === 0 ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                  }`} />
                  <div className="text-xs">
                    <p className={`font-medium ${i === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                      {evt.description}
                    </p>
                    <p className="text-gray-400 mt-0.5">
                      {evt.time && new Date(evt.time).toLocaleString()}
                      {evt.location && ` · ${evt.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {events.length > 3 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 ml-3"
            >
              {t('tracking.showAll', { count: events.length })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
