// Адреса картинок с учётом базового пути сайта (/realty-catalog/ на GitHub Pages)

export function asset(path) {
  return useRuntimeConfig().app.baseURL + path.replace(/^\//, '')
}

export const fontPreload = (href) => ({ rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' })

export const photo = (slug, n, width) => asset(`img/objects/${slug}/${n}-${width}.webp`)

export const photoSrcset = (slug, n) => `${photo(slug, n, 400)} 400w, ${photo(slug, n, 800)} 800w`

// Точка на статичной карте (проекция Меркатора, как у тайлов OpenStreetMap), в процентах от размера картинки
export function projectToMap([lat, lon], { zoom, center, width, height }) {
  const world = (la, lo) => {
    const s = Math.sin((la * Math.PI) / 180)
    const scale = 256 * 2 ** zoom
    return [((lo + 180) / 360) * scale, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale]
  }
  const [x, y] = world(lat, lon)
  const [cx, cy] = world(center[0], center[1])
  return { left: ((x - cx + width / 2) / width) * 100, top: ((y - cy + height / 2) / height) * 100 }
}
