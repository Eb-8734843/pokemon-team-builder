// Usage data exported by the Python meta tracker (public/data/meta-<format>.json).
import { getPokemon, slugify, toApiName } from './pokeapi.js'
import { effectiveness, problemTypes, teamDefense, cap } from './typeChart.js'

export const FORMATS = [
  { id: 'gen9ou', label: 'Gen 9 OU' },
  { id: 'gen9uu', label: 'Gen 9 UU' },
]

export async function loadMeta(format) {
  const res = await fetch(`${import.meta.env.BASE_URL}data/meta-${format}.json`)
  if (!res.ok) return null
  const meta = await res.json()
  const index = new Map()
  for (const p of meta.pokemon) {
    index.set(p.slug, p)
    index.set(toApiName(p.slug), p)
  }
  return { ...meta, index }
}

/** Usage entry for a team member, matched on the key it was added with or its PokéAPI name. */
export function findMeta(meta, member) {
  if (!meta) return null
  return meta.index.get(member.key) ?? meta.index.get(member.data.name) ?? null
}

/**
 * Suggest teammates that patch the team's weaknesses, preferring Pokémon that real players
 * already pair with the current team (from Smogon teammate stats).
 */
export async function recommend(team, meta, n = 5) {
  if (!meta || team.length === 0 || team.length >= 6) return []
  const members = team.map((m) => m.data)
  const problems = problemTypes(teamDefense(members)).map((d) => d.type)
  const alreadyWeak = teamDefense(members).filter((d) => d.weak >= 2).map((d) => d.type)

  const onTeam = new Set(team.flatMap((m) => [m.key, m.data.name]))
  const candidates = new Map() // slug -> { synergy, partners }
  for (const m of team) {
    const entry = findMeta(meta, m)
    if (!entry) continue
    for (const [mate, pct] of entry.teammates) {
      const slug = slugify(mate)
      if (onTeam.has(slug) || onTeam.has(toApiName(slug))) continue
      const c = candidates.get(slug) ?? { slug, name: mate, synergy: 0, partners: [] }
      c.synergy += pct / team.length
      c.partners.push({ with: entry.name, pct })
      candidates.set(slug, c)
    }
  }
  // Not enough partner data (e.g. off-meta picks): fall back to the most used Pokémon.
  for (const p of meta.pokemon) {
    if (candidates.size >= 25) break
    if (!candidates.has(p.slug) && !onTeam.has(p.slug) && !onTeam.has(toApiName(p.slug))) {
      candidates.set(p.slug, { slug: p.slug, name: p.name, synergy: p.usage / 4, partners: [] })
    }
  }

  const shortlist = [...candidates.values()].sort((a, b) => b.synergy - a.synergy).slice(0, 25)
  const fetched = await Promise.allSettled(shortlist.map((c) => getPokemon(c.slug)))

  const scored = []
  fetched.forEach((r, i) => {
    if (r.status !== 'fulfilled' || onTeam.has(r.value.name)) return
    const c = shortlist[i]
    const data = r.value
    const fixes = problems.filter((t) => effectiveness(t, data.types) < 1)
    const adds = alreadyWeak.filter((t) => effectiveness(t, data.types) > 1)
    const score = fixes.length * 25 + c.synergy - adds.length * 12
    const reasons = []
    if (fixes.length) reasons.push(`Covers ${fixes.map(cap).join(', ')}`)
    const best = c.partners.sort((a, b) => b.pct - a.pct)[0]
    if (best) reasons.push(`Paired with ${best.with} on ${Math.round(best.pct)}% of teams`)
    else reasons.push('Popular in this format')
    if (adds.length) reasons.push(`But also weak to ${adds.map(cap).join(', ')}`)
    scored.push({ key: c.slug, name: c.name, data, score, fixes, adds, reasons })
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, n)
}
