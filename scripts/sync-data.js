// Copy the latest JSON export from the Python meta tracker into public/data.
// Usage: npm run sync-data   (expects ../pokemon-meta-tracker next to this project)
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, '..', 'pokemon-meta-tracker', 'exports')
const dest = join(root, 'public', 'data')

mkdirSync(dest, { recursive: true })
const files = readdirSync(src).filter((f) => f.startsWith('meta-') && f.endsWith('.json'))
for (const f of files) {
  copyFileSync(join(src, f), join(dest, f))
  console.log(`Copied ${f}`)
}
if (!files.length) console.log(`No exports found in ${src}. Run "meta-tracker export" first.`)
