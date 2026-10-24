import { describe, expect, it } from 'vitest'
import { effectiveness, problemTypes, stabCoverage, teamDefense, weaknessWarnings } from './typeChart.js'
import { teamScore } from './score.js'
import { slugify, toApiName } from './pokeapi.js'
import { makeShareLink, readShareLink } from './storage.js'

const stats = (o = {}) => ({
  hp: 80, attack: 80, defense: 80, 'special-attack': 80, 'special-defense': 80, speed: 80, ...o,
})
const mon = (name, types, s) => ({ name, types, stats: stats(s) })

describe('type chart', () => {
  it('multiplies dual types', () => {
    expect(effectiveness('ice', ['dragon', 'ground'])).toBe(4) // Garchomp
    expect(effectiveness('electric', ['water', 'ground'])).toBe(0) // Swampert
    expect(effectiveness('fire', ['water', 'rock'])).toBe(0.25)
    expect(effectiveness('fighting', ['steel', 'dark'])).toBe(4) // Kingambit
  })

  it('counts team weaknesses and warns like "4 of your 6 are weak to Ground"', () => {
    const team = [
      mon('heatran', ['fire', 'steel']),
      mon('raging-bolt', ['electric', 'dragon']),
      mon('iron-moth', ['fire', 'poison']),
      mon('gholdengo', ['steel', 'ghost']),
      mon('corviknight', ['flying', 'steel']),
      mon('dragonite', ['dragon', 'flying']),
    ]
    const defense = teamDefense(team)
    const ground = defense.find((d) => d.type === 'ground')
    expect(ground).toMatchObject({ weak: 4, immune: 2 })
    expect(problemTypes(defense).map((d) => d.type)).toContain('ground')
    expect(weaknessWarnings(defense, 6).find((w) => w.type === 'ground').text).toBe(
      '4 of your 6 are weak to Ground, only 2 resist it.',
    )
  })

  it('computes STAB coverage', () => {
    const covered = stabCoverage([mon('a', ['ground'])])
    expect(covered.sort()).toEqual(['electric', 'fire', 'poison', 'rock', 'steel'])
  })
})

describe('team score', () => {
  it('is null for an empty team and within 0-100 otherwise', () => {
    expect(teamScore([])).toBeNull()
    const s = teamScore([mon('a', ['water'], { speed: 120, attack: 130 }), mon('b', ['fire'], { 'special-attack': 130 })])
    expect(s.total).toBeGreaterThanOrEqual(0)
    expect(s.total).toBeLessThanOrEqual(100)
    expect(s.parts.map((p) => p.label)).toEqual(['Defence', 'Coverage', 'Speed', 'Roles'])
  })

  it('rewards a balanced team over a mono-type one', () => {
    const mono = Array.from({ length: 6 }, (_, i) => mon(`g${i}`, ['grass']))
    const balanced = [
      mon('a', ['ground', 'fighting'], { attack: 130, speed: 90 }),
      mon('b', ['steel', 'dark'], { attack: 135, speed: 50 }),
      mon('c', ['steel', 'ghost'], { 'special-attack': 133, speed: 84 }),
      mon('d', ['water', 'grass'], { attack: 120, speed: 110 }),
      mon('e', ['dragon', 'ghost'], { attack: 120, speed: 142 }),
      mon('f', ['psychic', 'fairy'], { 'special-attack': 136, speed: 29 }),
    ]
    expect(teamScore(balanced).total).toBeGreaterThan(teamScore(mono).total)
  })
})

describe('names and links', () => {
  it('slugifies Smogon names like the Python export', () => {
    expect(slugify('Slowking-Galar')).toBe('slowking-galar')
    expect(slugify('Mr. Mime')).toBe('mr-mime')
    expect(slugify('Flabébé')).toBe('flabebe')
    expect(slugify('Farfetch’d')).toBe('farfetchd')
    expect(toApiName(slugify('Ogerpon-Wellspring'))).toBe('ogerpon-wellspring-mask')
  })

  it('round-trips a share link', () => {
    const link = makeShareLink(['great-tusk', 'kingambit'], 'gen9uu', new URL('https://example.com/app/'))
    expect(readShareLink(new URL(link).search)).toEqual({ keys: ['great-tusk', 'kingambit'], format: 'gen9uu' })
    expect(readShareLink('?foo=1')).toBeNull()
  })
})
