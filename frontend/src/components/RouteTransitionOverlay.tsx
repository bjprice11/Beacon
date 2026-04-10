import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BeaconLoadingMark from './BeaconLoadingMark.tsx'

/**
 * Brief full-color logo flash on client-side navigations (navbar stays usable above).
 */
export default function RouteTransitionOverlay() {
  const { key } = useLocation()
  const [visible, setVisible] = useState(false)
  const firstKey = useRef(true)

  useEffect(() => {
    if (firstKey.current) {
      firstKey.current = false
      return
    }
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), 300)
    return () => window.clearTimeout(id)
  }, [key])

  if (!visible) return null

  return (
    <div className="route-transition-overlay" aria-hidden="true">
      <BeaconLoadingMark size="lg" />
    </div>
  )
}
