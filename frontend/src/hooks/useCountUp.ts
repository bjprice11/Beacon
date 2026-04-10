import { useEffect, useRef, useState } from 'react'

/** Ease-out cubic; same curve as the landing impact stats. */
export function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    if (!start || hasRun.current) return
    hasRun.current = true
    const t0 = performance.now()
    let raf: number
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setCount(Math.round((1 - (1 - p) ** 3) * target))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return count
}
