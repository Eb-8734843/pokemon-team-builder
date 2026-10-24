// Thin PokéAPI client with in-memory caching. https://pokeapi.co (free, no key)
const API = 'https://pokeapi.co/api/v2'

// Smogon names whose PokéAPI id differs. Anything else falls back to the first "<name>-*" match.
const ALIASES = {
  'ogerpon-wellspring': 'ogerpon-wellspring-mask',
  'ogerpon-hearthflame': 'ogerpon-hearthflame-mask',
  'ogerpon-cornerstone': 'ogerpon-cornerstone-mask',
  urshifu: 'urshifu-single-strike',
  landorus: 'landorus-incarnate',
  thundurus: 'thundurus-incarnate',
  tornadus: 'tornadus-incarnate',
  enamorus: 'enamorus-incarnate',
  maushold: 'maushold-family-of-four',
  palafin: 'palafin-zero',
  basculegion: 'basculegion-male',
  'basculegion-f': 'basculegion-female',
  indeedee: 'indeedee-male',
  'indeedee-f': 'indeedee-female',
  meowstic: 'meowstic-male',
  oinkologne: 'oinkologne-male',
  tatsugiri: 'tatsugiri-curly',
  mimikyu: 'mimikyu-disguised',
  eiscue: 'eiscue-ice',
  morpeko: 'morpeko-full-belly',
  toxtricity: 'toxtricity-amped',
  lycanroc: 'lycanroc-midday',
  dudunsparce: 'dudunsparce-two-segment',
  keldeo: 'keldeo-ordinary',
  meloetta: 'meloetta-aria',
  giratina: 'giratina-altered',
  shaymin: 'shaymin-land',
  deoxys: 'deoxys-normal',
  zygarde: 'zygarde-50',
  aegislash: 'aegislash-shield',
}

export const toApiName = (slug) => ALIASES[slug] ?? slug

/** Smogon display name -> slug, e.g. "Slowking-Galar" -> "slowking-galar". Mirrors the Python export. */
export function slugify(name) {
  return name
    .replace('♀', '-f')
    .replace('♂', '-m')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.'’:%]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** "great-tusk" -> "Great Tusk", "ogerpon-wellspring-mask" -> "Ogerpon Wellspring Mask" */
export const prettyName = (slug) =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

let namesPromise
export function getAllNames() {
  namesPromise ??= fetch(`${API}/pokemon?limit=2000`)
    .then((r) => {
      if (!r.ok) throw new Error('Could not load the Pokémon list')
      return r.json()
    })
    .then((d) => d.results.map((p) => p.name))
    .catch((e) => {
      namesPromise = undefined
      throw e
    })
  return namesPromise
}

function simplify(d) {
  return {
    name: d.name,
    id: d.id,
    types: d.types.map((t) => t.type.name),
    stats: Object.fromEntries(d.stats.map((s) => [s.stat.name, s.base_stat])),
    sprite: d.sprites.other?.['official-artwork']?.front_default ?? d.sprites.front_default,
    icon: d.sprites.front_default ?? d.sprites.other?.['official-artwork']?.front_default,
  }
}

const cache = new Map()

/** Fetch one Pokémon by slug/name. Resolves to { name, id, types, stats, sprite, icon }. */
export function getPokemon(slugOrName) {
  const key = toApiName(slugify(slugOrName))
  if (!cache.has(key)) {
    const promise = (async () => {
      let res = await fetch(`${API}/pokemon/${key}`)
      if (res.status === 404) {
        const alt = (await getAllNames()).find((n) => n.startsWith(`${key}-`))
        if (alt) res = await fetch(`${API}/pokemon/${alt}`)
      }
      if (!res.ok) throw new Error(`Couldn't find "${slugOrName}" on PokéAPI`)
      return simplify(await res.json())
    })()
    cache.set(key, promise)
    promise.catch(() => cache.delete(key))
  }
  return cache.get(key)
}
