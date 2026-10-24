// Gen 6+ type chart. CHART[attacker][defender] = multiplier; anything missing is 1x.
export const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

const CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2,
    dragon: 0.5, steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0,
    dark: 2, steel: 2, fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5,
    dark: 2, steel: 0.5, fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

export const TYPE_COLORS = {
  normal: '#9fa19f', fire: '#e62829', water: '#2980ef', electric: '#fac000', grass: '#3fa129',
  ice: '#3dcef3', fighting: '#ff8000', poison: '#9141cb', ground: '#915121', flying: '#81b9ef',
  psychic: '#ef4179', bug: '#91a119', rock: '#afa981', ghost: '#704170', dragon: '#5060e1',
  dark: '#624d4e', steel: '#60a1b8', fairy: '#ef70ef',
}

/** Damage multiplier of an attacking type against a list of defending types. */
export function effectiveness(attackType, defendTypes) {
  return defendTypes.reduce((m, t) => m * (CHART[attackType][t] ?? 1), 1)
}

/**
 * For every attacking type: how many team members are weak to it, resist it or are immune.
 * `team` is a list of { name, types }.
 */
export function teamDefense(team) {
  return TYPES.map((type) => {
    const members = team.map((p) => ({ name: p.name, mult: effectiveness(type, p.types) }))
    return {
      type,
      members,
      weak: members.filter((m) => m.mult > 1).length,
      resist: members.filter((m) => m.mult > 0 && m.mult < 1).length,
      immune: members.filter((m) => m.mult === 0).length,
    }
  })
}

/** Types the team handles badly: 3+ weak, or more weak members than resists/immunities (min 2). */
export function problemTypes(defense) {
  return defense
    .filter((d) => d.weak >= 3 || (d.weak >= 2 && d.weak > d.resist + d.immune))
    .sort((a, b) => b.weak - a.weak)
}

export function weaknessWarnings(defense, teamSize) {
  return problemTypes(defense).map((d) => {
    const cover = d.resist + d.immune
    const tail = cover === 0 ? ' and nothing resists it' : `, only ${cover} resist${cover === 1 ? 's' : ''} it`
    return { type: d.type, text: `${d.weak} of your ${teamSize} are weak to ${cap(d.type)}${tail}.` }
  })
}

/** Defending types that at least one of the team's own types hits super-effectively (STAB coverage). */
export function stabCoverage(team) {
  const attackTypes = new Set(team.flatMap((p) => p.types))
  return TYPES.filter((def) => [...attackTypes].some((atk) => effectiveness(atk, [def]) > 1))
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
