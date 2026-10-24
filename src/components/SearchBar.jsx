import { useEffect, useMemo, useState } from 'react'
import { getAllNames, prettyName } from '../lib/pokeapi.js'

export default function SearchBar({ onAdd, disabled, popular }) {
  const [names, setNames] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    getAllNames().then(setNames, (e) => setError(e.message))
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '-')
    if (!q) return []
    const starts = names.filter((n) => n.startsWith(q))
    const contains = names.filter((n) => !n.startsWith(q) && n.includes(q))
    return [...starts, ...contains].slice(0, 8)
  }, [names, query])

  const pick = (name) => {
    onAdd(name)
    setQuery('')
    setActive(0)
  }

  const onKeyDown = (e) => {
    if (!matches.length) return
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % matches.length)
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + matches.length) % matches.length)
    else if (e.key === 'Enter') pick(matches[active])
    else return
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          placeholder={disabled ? 'Team is full (6/6)' : 'Search Pokémon, e.g. Garchomp'}
          aria-label="Search Pokémon"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-slate-100"
        />
        {matches.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {matches.map((n, i) => (
              <li key={n}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(n)}
                  className={`w-full px-4 py-2 text-left ${i === active ? 'bg-slate-100' : ''}`}
                >
                  {prettyName(n)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {popular?.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-slate-500">Popular:</span>
          {popular.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onAdd(p.slug)}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 hover:border-brand hover:text-brand"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
