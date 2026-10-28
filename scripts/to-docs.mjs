// Копирует результат nuxt generate в docs/, откуда сайт публикует GitHub Pages.
// .nojekyll нужен, иначе Pages не отдаст папку _nuxt с JS и CSS.
import { cpSync, rmSync, writeFileSync } from 'node:fs'

rmSync('docs', { recursive: true, force: true })
cpSync('.output/public', 'docs', { recursive: true })
writeFileSync('docs/.nojekyll', '')
console.log('docs: готово')
