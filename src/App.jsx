import { useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import TeamSlots from './components/TeamSlots.jsx'
import TypeGrid from './components/TypeGrid.jsx'
import { Recommendations, ScoreCard, Warnings } from './components/Coach.jsx'
import { getPokemon } from './lib/pokeapi.js'
import { FORMATS, findMeta, loadMeta, recommend } from './lib/meta.js'
import { teamDefense, weaknessWarnings } from './lib/typeChart.js'
import { teamScore } from './lib/score.js'
import { loadSaved, makeShareLink, readShareLink, save } from './lib/storage.js'

const initial = readShareLink() ?? loadSaved()

export default function App() {
  const [format, setFormat] = useState(
    FORMATS.some((f) => f.id === initial.format) ? initial.format : FORMATS[0].id,
  )
  const [team, setTeam] = useState([]) // [{ key, data }]
  // Starts at the number of saved Pokémon so nothing is saved over them while they load.
  const [pending, setPending] = useState(initial.keys?.length ?? 0)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [recs, setRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const restored = useRef(false)

  // Restore the team from a share link or localStorage, once.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const keys = initial.keys ?? []
    if (!keys.length) return
    Promise.allSettled(keys.map((k) => getPokemon(k))).then((results) => {
      setTeam(results.flatMap((r, i) => (r.status === 'fulfilled' ? [{ key: keys[i], data: r.value }] : [])))
      setPending(0)
    })
  }, [])

  useEffect(() => {
    let live = true
    loadMeta(format).then((m) => live && setMeta(m))
    return () => {
      live = false
    }
  }, [format])

  useEffect(() => {
    if (!restored.current || pending) return
    save({ keys: team.map((m) => m.key), format })
  }, [team, format, pending])

  const members = useMemo(() => team.map((m) => m.data), [team])
  const defense = useMemo(() => teamDefense(members), [members])
  const warnings = useMemo(() => weaknessWarnings(defense, members.length), [defense, members.length])
  const score = useMemo(() => teamScore(members), [members])

  useEffect(() => {
    let live = true
    setRecsLoading(true)
    recommend(team, meta)
      .then((r) => live && setRecs(r))
      .catch(() => live && setRecs([]))
      .finally(() => live && setRecsLoading(false))
    return () => {
      live = false
    }
  }, [team, meta])

  const add = async (key) => {
    if (team.length + pending >= 6) return
    setError(null)
    setPending((p) => p + 1)
    try {
      const data = await getPokemon(key)
      setTeam((t) => (t.length < 6 && !t.some((m) => m.data.name === data.name) ? [...t, { key, data }] : t))
    } catch (e) {
      setError(e.message)
    } finally {
      setPending((p) => p - 1)
    }
  }

  const remove = (i) => setTeam((t) => t.filter((_, j) => j !== i))

  const share = async () => {
    const link = makeShareLink(team.map((m) => m.key), format)
    window.history.replaceState(null, '', link)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', link)
    }
  }

  const formatLabel = FORMATS.find((f) => f.id === format)?.label
  const popular = meta?.pokemon.slice(0, 8).filter((p) => !team.some((m) => m.key === p.slug))

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Pokémon Team Builder</h1>
          <p className="text-sm text-slate-500">
            Build a team of 6. It warns you about weaknesses and suggests better picks from real usage data
            {meta ? ` (${formatLabel}, ${meta.month})` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            aria-label="Format"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <button
            type="button"
            onClick={share}
            disabled={!team.length}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {copied ? 'Link copied!' : 'Share team'}
          </button>
          <button
            type="button"
            onClick={() => setTeam([])}
            disabled={!team.length}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <SearchBar onAdd={add} disabled={team.length + pending >= 6} popular={popular} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <TeamSlots team={team} metaFor={(m) => findMeta(meta, m)} onRemove={remove} loading={pending} />
          {team.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Defensive type chart</h2>
              <TypeGrid defense={defense} team={team} />
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {team.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Add a Pokémon to get started. Try one of the popular picks above.
            </section>
          ) : (
            <>
              <ScoreCard score={score} />
              <Warnings warnings={warnings} />
              {team.length < 6 && (
                <Recommendations
                  recs={recs}
                  loading={recsLoading}
                  hasMeta={!!meta}
                  formatLabel={formatLabel}
                  onAdd={add}
                />
              )}
            </>
          )}
        </aside>
      </main>

      <footer className="mt-12 text-center text-xs text-slate-400">
        Pokémon data from PokéAPI. Usage stats from Smogon via the{' '}
        <a className="underline" href="https://github.com/Eb-8734843/pokemon-meta-tracker">Pokémon Meta Tracker</a>.
        Unofficial fan project.
      </footer>
    </div>
  )
}
