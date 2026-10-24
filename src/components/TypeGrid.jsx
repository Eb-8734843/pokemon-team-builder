import TypeBadge from './TypeBadge.jsx'
import { prettyName } from '../lib/pokeapi.js'

const LABEL = { 4: '4×', 2: '2×', 1: '', 0.5: '½', 0.25: '¼', 0: '0' }
const CELL = {
  4: 'bg-red-600 text-white',
  2: 'bg-red-200 text-red-900',
  1: '',
  0.5: 'bg-green-200 text-green-900',
  0.25: 'bg-green-500 text-white',
  0: 'bg-slate-700 text-white',
}

export default function TypeGrid({ defense, team }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[28rem] text-center text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-2 py-2 text-left font-medium">Attack type</th>
            {team.map((m, i) => (
              <th key={i} className="px-1 py-1 font-medium" title={prettyName(m.data.name)}>
                <img src={m.data.icon} alt={prettyName(m.data.name)} className="mx-auto h-9 w-9 object-contain" />
              </th>
            ))}
            <th className="px-2 font-medium">Weak</th>
            <th className="px-2 font-medium">Resist</th>
          </tr>
        </thead>
        <tbody>
          {defense.map((d) => {
            const bad = d.weak >= 3 || (d.weak >= 2 && d.weak > d.resist + d.immune)
            return (
              <tr key={d.type} className={`border-b border-slate-100 last:border-0 ${bad ? 'bg-red-50' : ''}`}>
                <td className="px-2 py-1 text-left"><TypeBadge type={d.type} small /></td>
                {d.members.map((m, i) => (
                  <td key={i} className="p-0.5">
                    <span className={`block rounded py-0.5 font-semibold ${CELL[m.mult]}`}>{LABEL[m.mult]}</span>
                  </td>
                ))}
                <td className={`font-semibold tabular-nums ${bad ? 'text-red-600' : 'text-slate-600'}`}>
                  {d.weak || ''}
                </td>
                <td className="tabular-nums text-green-700">{d.resist + d.immune || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
