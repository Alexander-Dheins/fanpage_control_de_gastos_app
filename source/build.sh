#!/bin/sh
# Regenera los .glb y el index.html de la raíz del repo.
set -e
cd "$(dirname "$0")"
node build-models.mjs
cp phone.glb laptop.glb ../models/ && rm phone.glb laptop.glb
python3 - <<'PY'
import base64
b=lambda f: base64.b64encode(open(f,'rb').read()).decode()
open('src/assets.js','w').write(
  f'export const PHONE="{b("../models/phone.glb")}";\n'
  f'export const LAPTOP="{b("../models/laptop.glb")}";\n'
  f'export const LOGO="data:image/jpeg;base64,{b("assets/logo.jpg")}";\n')
PY
npx esbuild src/main.js --bundle --minify --format=iife --outfile=dist/app.js --log-level=error
python3 - <<'PY'
import base64
js=open('dist/app.js').read().replace('</script','<\\/script')
logo='data:image/jpeg;base64,'+base64.b64encode(open('assets/logo.jpg','rb').read()).decode()
open('../index.html','w').write(open('template.html').read().replace('__LOGO__',logo).replace('__JS__',js))
PY
echo "Listo: ../index.html"
