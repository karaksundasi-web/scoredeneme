import sys
sys.path.insert(0, sys.argv[1])
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
base = 'node_modules/@fontsource/'
for pkg, fam, ws in [('barlow-condensed', 'BarlowCondensed', [600, 700, 800]), ('inter', 'Inter', [400, 600])]:
    for w in ws:
        parts = []
        for sub in ('latin', 'latin-ext'):
            f = TTFont(f'{base}{pkg}/files/{pkg}-{sub}-{w}-normal.woff2'); f.flavor = None
            p = f'logs/_{pkg}-{sub}-{w}.ttf'; f.save(p); parts.append(p)
        m = Merger().merge(parts); m.flavor = 'woff2'
        out = f'fonts/{fam}-{w}.woff2'; m.save(out); print(out)
