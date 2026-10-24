import TypeBadge from './TypeBadge.jsx'
import { prettyName } from '../lib/pokeapi.js'

const STAT_LABELS = {
  hp: 'HP', attack: 'Atk', defense: 'Def', 'special-attack': 'SpA', 'special-defense': 'SpD', speed: 'Spe',
}

function StatBars({ stats }) {
  return (
    <dl className="grid grid-cols-[2.25rem_1.75rem_1fr] items-center gap-x-1.5 gap-y-0.5 text-[11px]">
      {Object.entries(STAT_LABELS).map(([key, label]) => (
        <div key={key} className="contents">
          <dt className="text-slate-500">{label}</dt>
          <dd className="text-right tabular-nums">{stats[key]}</dd>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, (stats[key] / 180) * 100)}%`,
                backgroundColor: stats[key] >= 100 ? '#16a34a' : stats[key] >= 70 ? '#eab308' : '#f97316',
              }}
            />
          </div>
        </div>
      ))}
    </dl>
  )
}

function Slot({ member, meta, onRemove }) {
  const { data } = member
  return (
    <li className="relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${prettyName(data.name)}`}
        className="absolute right-2 top-2 rounded-full px-2 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        ×
      </button>
      <div className="flex items-center gap-2">
        <img src={data.sprite} alt="" className="h-16 w-16 object-contain" loading="lazy" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{meta?.name ?? prettyName(data.name)}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {data.types.map((t) => <TypeBadge key={t} type={t} small />)}
          </div>
          {meta && (
            <p className="mt-1 text-xs text-slate-500">
              #{meta.rank} · {meta.usage.toFixed(1)}% usage
            </p>
          )}
        </div>
      </div>
      <StatBars stats={data.stats} />
      {meta?.items?.length > 0 && (
        <p className="truncate text-xs text-slate-500" title={meta.items.map(([i, p]) => `${i} ${p}%`).join(', ')}>
          <span className="font-medium text-slate-600">Items:</span>{' '}
          {meta.items.slice(0, 2).map(([i, p]) => `${i} (${Math.round(p)}%)`).join(', ')}
        </p>
      )}
    </li>
  )
}

export default function TeamSlots({ team, metaFor, onRemove, loading }) {
  const empty = Math.max(0, 6 - team.length - loading)
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((m, i) => (
        <Slot key={`${m.key}-${i}`} member={m} meta={metaFor(m)} onRemove={() => onRemove(i)} />
      ))}
      {Array.from({ length: loading }, (_, i) => (
        <li key={`loading-${i}`} className="h-48 animate-pulse rounded-2xl bg-slate-200/70" />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <li
          key={`empty-${i}`}
          className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-400"
        >
          Empty slot
        </li>
      ))}
    </ol>
  )
}
