type BeaconLoadingMarkProps = {
  /** Default fits most page shells; `lg` for route flash overlay */
  size?: 'sm' | 'md' | 'lg'
  /** Announced to screen readers */
  label?: string
}

export default function BeaconLoadingMark({ size = 'md', label = 'Loading' }: BeaconLoadingMarkProps) {
  return (
    <div
      className={`beacon-loading-mark beacon-loading-mark--${size}`}
      role="status"
      aria-live="polite"
    >
      <span className="beacon-loading-mark__spinner" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}
