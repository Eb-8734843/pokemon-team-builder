import { TYPE_COLORS } from '../lib/typeChart.js'

export default function TypeBadge({ type, small = false }) {
  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wide text-white ${
        small ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {type}
    </span>
  )
}
