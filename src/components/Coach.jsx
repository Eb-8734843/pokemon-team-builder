import TypeBadge from './TypeBadge.jsx'
import { prettyName } from '../lib/pokeapi.js'

export function ScoreCard({ score }) {
  if (!score) return null
  const colour = score.total >= 75 ? 'text-green-600' : score.total >= 50 ? 'text-amber-500' : 'text-red-600'
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Team score</h2>
        <p className={`text-3xl font-bold tabular-nums ${colour}`}>
          {score.total}
          <span className="text-base font-medium text-slate-400">/100</span>
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {score.parts.map((p) => (
          <li key={p.label}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{p.label}</span>
              <span className="tabular-nums text-slate-500">{p.value}/{p.max}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${(p.value / p.max) * 100}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{p.note}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Warnings({ warnings }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Weakness warnings</h2>
      {warnings.length === 0 ? (
        <p className="mt-2 text-sm text-green-700">No shared weaknesses. Nice and balanced.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {warnings.map((w) => (
            <li key={w.type} className="flex items-start gap-2 text-sm">
              <TypeBadge type={w.type} small />
              <span>{w.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Recommendations({ recs, loading, hasMeta, formatLabel, onAdd }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Suggested teammates</h2>
      <p className="text-xs text-slate-500">
        {hasMeta
          ? `Based on ${formatLabel} usage stats: picks that fix your weaknesses and that players already pair with your team.`
          : 'No usage data loaded, so suggestions are unavailable.'}
      </p>
      {loading && <p className="mt-3 text-sm text-slate-500">Finding good partners…</p>}
      {!loading && recs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {recs.map((r) => (
            <li key={r.key} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2">
              <img src={r.data.icon} alt="" className="h-12 w-12 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">{r.name ?? prettyName(r.data.name)}</span>
                  {r.data.types.map((t) => <TypeBadge key={t} type={t} small />)}
                </div>
                <ul className="text-xs text-slate-600">
                  {r.reasons.map((reason) => (
                    <li key={reason} className={reason.startsWith('But') ? 'text-amber-700' : ''}>{reason}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onAdd(r.key)}
                className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
