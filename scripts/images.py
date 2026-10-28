"""Нарезка фото для сайта: WebP нужных размеров из исходников 1800 px.

Запуск: python scripts/images.py <папка с исходными jpg>
Исходники (фото с Unsplash, авторы в CREDITS.md) в репозиторий не входят, только результат в public/img.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'img'

OBJECTS = [
    'primorsky-2k', 'moskovsky-studio', 'vyborgsky-2k', 'petrogradsky-1k', 'admiralteysky-3k', 'vasileostrovsky-loft',
    'kalininsky-2k', 'petrogradsky-3k', 'centralny-4k', 'vsevolozhsky-house', 'kurortny-house', 'pushkinsky-townhouse',
]


def load(name):
    return Image.open(SRC / f'{name}.jpg').convert('RGB')


def save(img, path, quality=74):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=quality, method=6)


def fit(img, w, h, center=(0.5, 0.5)):
    return ImageOps.fit(img, (w, h), Image.LANCZOS, centering=center)


def width(img, w):
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


# Объекты: карточки 4:3 (400 и 800 px) и большие фото для галереи (1600 px по ширине)
for slug in OBJECTS:
    for n in range(1, 5):
        img = load(f'{slug}-{n}')
        save(fit(img, 400, 300), OUT / 'objects' / slug / f'{n}-400.webp', 72)
        save(fit(img, 800, 600), OUT / 'objects' / slug / f'{n}-800.webp', 72)
        save(width(img, 1600), OUT / 'objects' / slug / f'{n}-1600.webp')

# Первый экран: широкий кадр для десктопа и 16:10 для телефона
hero = load('hero-canal')
for w in (800, 1400, 1800):
    save(fit(hero, w, round(w * 500 / 1392), (0.5, 0.62)), OUT / 'hero' / f'canal-{w}.webp')
for w in (480, 800):
    save(fit(hero, w, round(w * 10 / 16), (0.3, 0.5)), OUT / 'hero' / f'canal-m-{w}.webp')

# Подборки 3:4, блок доверия и агенты 4:5
tiles = {'first': ('kalininsky-2k-1', (0.42, 0.5)), 'new': ('vyborgsky-2k-1', (0.5, 0.5)),
         'center': ('centralny-4k-1', (0.5, 0.4)), 'country': ('kurortny-house-1', (0.5, 0.5))}
for key, (name, center) in tiles.items():
    img = load(name)
    for w in (300, 600):
        save(fit(img, w, w * 4 // 3, center), OUT / 'tiles' / f'{key}-{w}.webp')
trust = load('centralny-4k-2')
for w in (400, 800):
    save(fit(trust, w, w * 5 // 4, (0.5, 0.55)), OUT / f'trust-{w}.webp')
for key, top in (('anna', 0.3), ('sergey', 0.25), ('maria', 0.3)):
    img = load(f'agent-{key}')
    for w in (240, 480):
        save(fit(img, w, w * 5 // 4, (0.5, top)), OUT / 'agents' / f'{key}-{w}.webp')

# Превью ссылки в соцсетях и мессенджерах
fit(hero, 1200, 630, (0.5, 0.6)).save(OUT.parent / 'og.jpg', quality=82, optimize=True, progressive=True)
print('готово:', sum(1 for _ in OUT.rglob('*.webp')), 'webp')
