type BeaconLoadingMarkProps = {
  /** Default fits most page shells; `lg` for route flash overlay */
  size?: 'sm' | 'md' | 'lg'
  /** Announced to screen readers */
  label?: string
}

/** Full-color Beacon mark (public/logo-color.png) — use on light backgrounds. */
export default function BeaconLoadingMark({ size = 'md', label = 'Loading' }: BeaconLoadingMarkProps) {
  return (
    <div
      className={`beacon-loading-mark beacon-loading-mark--${size}`}
      role="status"
      aria-live="polite"
    >
      <img
        src="/logo-color.png"
        alt=""
        className="beacon-loading-mark__img"
        decoding="async"
        width={160}
        height={160}
      />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}
