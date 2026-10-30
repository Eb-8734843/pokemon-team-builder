# Pokémon Team Builder

Build a team of 6 and get **coached**: it warns you about shared weaknesses, scores the team, and
suggests better picks using real competitive usage data.

> **Live site: [pokemon-team-builder-lemon.vercel.app](https://pokemon-team-builder-lemon.vercel.app)**
>
> Usage data comes from my [Meta Tracker dashboard](https://pokemon-meta-tracker-lvxim6hx4xmcluqcqqmvst.streamlit.app).

Showdown's teambuilder lets you build a team but doesn't tell you what's wrong with it. This one explains and recommends:

- **Weakness warnings**, e.g. "4 of your 6 are weak to Ground, only 2 resist it."
- **Data-driven suggestions**: teammates that fix those weaknesses *and* that real players already pair with
  your Pokémon, from Smogon stats processed by my [Pokémon Meta Tracker](https://github.com/Eb-8734843/pokemon-meta-tracker).
- **Team score** out of 100 for defence, type coverage, speed spread and role balance.
- **Defensive type chart** for the whole team at a glance.
- **Shareable team links** and auto-save to localStorage.

## How it works

```
PokéAPI ──────────────▶ sprites, types, base stats ─┐
                                                     ├─▶ React app (type chart, score, coach)
Python Meta Tracker ──▶ public/data/meta-*.json ─────┘    usage, teammates, items per format
```

| File | Role |
| --- | --- |
| `src/lib/typeChart.js` | Gen 6+ type chart, team weaknesses/resistances, warnings, STAB coverage |
| `src/lib/meta.js` | Loads the usage JSON; ranks teammate suggestions by weaknesses fixed + real pairing rate |
| `src/lib/score.js` | Team score breakdown |
| `src/lib/pokeapi.js` | Cached PokéAPI client; maps Smogon names to PokéAPI ids (e.g. Ogerpon masks) |
| `src/lib/storage.js` | localStorage persistence and share links (`?team=great-tusk,kingambit&format=gen9ou`) |

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the type chart, scoring, names and links
npm run build      # production build in dist/
```

### Updating the usage data

The JSON in `public/data` comes from the Python project. With both repos side by side:

```bash
cd ../pokemon-meta-tracker && meta-tracker export && meta-tracker --format gen9uu export
cd ../pokemon-team-builder && npm run sync-data
```

## Deploy

On [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import this repo. Both detect Vite
automatically (build command `npm run build`, output folder `dist`).

## Roadmap

- [x] Search with PokéAPI, team slots, localStorage
- [x] Type chart, weakness warnings
- [x] Usage-based teammate suggestions
- [x] Team score, share links, mobile layout
- [ ] Account for abilities (Levitate, Flash Fire, Water Absorb…) in the type chart
- [ ] Offensive coverage from actual movesets, not just STAB types
- [ ] TypeScript

Pokémon data from [PokéAPI](https://pokeapi.co). Usage stats © Smogon University. Unofficial fan project.
