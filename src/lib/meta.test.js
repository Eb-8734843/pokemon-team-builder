import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadMeta } from './meta.js'

const data = { month: '2026-09', pokemon: [{ name: 'Great Tusk', slug: 'great-tusk' }] }
const ok = { ok: true, json: async () => data }

afterEach(() => vi.unstubAllGlobals())

describe('loadMeta', () => {
  it('prefers the live data from the tracker repo', async () => {
    const fetch = vi.fn(async () => ok)
    vi.stubGlobal('fetch', fetch)
    const meta = await loadMeta('gen9ou')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toContain('raw.githubusercontent.com')
    expect(meta.index.get('great-tusk').name).toBe('Great Tusk')
  })

  it('falls back to the bundled copy on a network error or bad status', async () => {
    for (const failure of [() => Promise.reject(new Error('offline')), async () => ({ ok: false })]) {
      const fetch = vi.fn().mockImplementationOnce(failure).mockImplementationOnce(async () => ok)
      vi.stubGlobal('fetch', fetch)
      const meta = await loadMeta('gen9ou')
      expect(fetch.mock.calls[1][0]).toContain('data/meta-gen9ou.json')
      expect(meta.month).toBe('2026-09')
    }
  })

  it('returns null when neither source works', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    expect(await loadMeta('gen9ou')).toBeNull()
  })
})
