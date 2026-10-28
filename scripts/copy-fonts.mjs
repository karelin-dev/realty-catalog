// Копирует нужные файлы шрифтов из пакетов Fontsource в app/assets/fonts:
// только кириллица и латиница, остальные наборы символов сайту не нужны.
import { copyFileSync, mkdirSync } from 'node:fs'

const files = {
  '@fontsource-variable/manrope': ['manrope-cyrillic-wght-normal', 'manrope-latin-wght-normal'],
  '@fontsource-variable/cormorant-garamond': [
    'cormorant-garamond-cyrillic-wght-normal',
    'cormorant-garamond-latin-wght-normal',
    'cormorant-garamond-cyrillic-wght-italic',
    'cormorant-garamond-latin-wght-italic'
  ]
}

mkdirSync('app/assets/fonts', { recursive: true })
for (const [pkg, names] of Object.entries(files)) {
  for (const name of names) {
    copyFileSync(`node_modules/${pkg}/files/${name}.woff2`, `app/assets/fonts/${name}.woff2`)
    console.log(`fonts: ${name}.woff2`)
  }
}
