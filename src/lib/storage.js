// Persist the team in localStorage and encode it in shareable URLs.
const KEY = 'team-builder:v1'

export function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private mode or storage full: the app still works, it just won't remember the team.
  }
}

/** Team + format from ?team=great-tusk,kingambit&format=gen9ou, or null if not present. */
export function readShareLink(search = window.location.search) {
  const params = new URLSearchParams(search)
  const team = params.get('team')
  if (!team) return null
  return {
    keys: team.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6),
    format: params.get('format') ?? undefined,
  }
}

export function makeShareLink(keys, format, base = window.location) {
  const url = new URL(base.pathname, base.origin)
  url.searchParams.set('team', keys.join(','))
  url.searchParams.set('format', format)
  return url.toString()
}
