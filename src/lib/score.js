// Team score out of 100: defence, offensive (STAB) coverage, speed spread and role balance.
import { TYPES, problemTypes, stabCoverage, teamDefense } from './typeChart.js'

export function teamScore(members) {
  if (members.length === 0) return null
  const defense = teamDefense(members)

  // Defence (40): lose 8 per type the team handles badly, 4 per type nothing resists.
  const problems = problemTypes(defense).length
  const unresisted = defense.filter((d) => d.resist + d.immune === 0 && d.weak > 0).length
  const defence = clamp(40 - problems * 8 - unresisted * 4, 0, 40)

  // Coverage (30): share of the 18 types the team's own types hit super-effectively.
  const covered = stabCoverage(members)
  const coverage = Math.round((covered.length / TYPES.length) * 30)

  // Speed (15): a couple of fast Pokémon, plus a spread of speeds.
  const speeds = members.map((p) => p.stats.speed)
  const fast = speeds.filter((s) => s >= 100).length
  const spread = Math.max(...speeds) - Math.min(...speeds)
  const speed = Math.min(fast, 2) * 5 + (spread >= 40 ? 5 : 0)

  // Roles (15): a mix of physical and special attackers.
  const physical = members.filter((p) => p.stats.attack > p.stats['special-attack'] + 10).length
  const special = members.filter((p) => p.stats['special-attack'] > p.stats.attack + 10).length
  const roles = physical >= 2 && special >= 2 ? 15 : physical >= 1 && special >= 1 ? 8 : 0

  return {
    total: defence + coverage + speed + roles,
    parts: [
      { label: 'Defence', value: defence, max: 40, note: `${problems} problem type${problems === 1 ? '' : 's'}` },
      { label: 'Coverage', value: coverage, max: 30, note: `hits ${covered.length}/18 types super-effectively` },
      { label: 'Speed', value: speed, max: 15, note: `${fast} fast (100+ base), spread ${spread}` },
      { label: 'Roles', value: roles, max: 15, note: `${physical} physical, ${special} special` },
    ],
  }
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
