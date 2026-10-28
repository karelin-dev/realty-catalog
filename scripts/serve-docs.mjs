// Локальная проверка собранного сайта так, как его отдаст GitHub Pages:
// docs/ по адресу http://localhost:3005/realty-catalog/, неизвестные адреса отдают 404.html,
// текстовые файлы сжимаются gzip (Pages тоже сжимает, иначе Lighthouse занижает скорость).
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { gzipSync } from 'node:zlib'

const BASE = '/realty-catalog/'
const ROOT = 'docs'
const PORT = Number(process.env.PORT) || 3005
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain'
}

async function resolveFile(path) {
  const file = normalize(join(ROOT, path))
  if (!file.startsWith(normalize(ROOT))) return null
  try {
    const info = await stat(file)
    return info.isDirectory() ? resolveFile(join(path, 'index.html')) : file
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/' || url === BASE.slice(0, -1)) {
    res.writeHead(302, { Location: BASE }).end()
    return
  }
  const file = url.startsWith(BASE) ? await resolveFile(url.slice(BASE.length)) : null
  const status = file ? 200 : 404
  const type = TYPES[extname(file || '.html')] || 'application/octet-stream'
  let body = await readFile(file || join(ROOT, '404.html'))
  const headers = { 'Content-Type': type, 'Cache-Control': 'max-age=600' }
  if (/text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    body = gzipSync(body)
    headers['Content-Encoding'] = 'gzip'
  }
  res.writeHead(status, headers)
  res.end(body)
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}`))
