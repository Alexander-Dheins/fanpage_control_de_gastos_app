# PY.DEV — Landing de ingresos y egresos

Hero 3D de la landing de PY.DEV: un celular y una laptop en 3D (modelos `.glb`) que muestran la app animada (login → resumen → movimientos → reportes), con botón para cambiar de equipo.

## Verla
Abre `index.html` en el navegador. Es un solo archivo: ya trae dentro three.js, los modelos y el logo.

## Estructura
```
index.html          Página lista para publicar (generada)
models/
  phone.glb         Celular; la malla de la pantalla se llama "Screen"
  laptop.glb        Laptop; pantalla "Screen", tapa con bisagra "Lid"
source/             Código fuente para regenerar todo
  build-models.mjs  Construye los .glb con three.js
  src/main.js       Escena 3D, controles y cambio de equipo
  src/screens.js    Dibuja la UI animada de la app en las pantallas
  template.html     Plantilla de la página
  build.sh          Regenera models/ e index.html
```

## Regenerar
```bash
cd source
npm install
npm run build
```

## Cambiar un modelo
Reemplaza el `.glb` en `models/` y vuelve a ejecutar `npm run build`, después de quitar `node build-models.mjs` y la línea que copia los `.glb` en `build.sh` para que no se sobrescriba tu modelo. La pantalla debe ser una malla llamada `Screen`; en la laptop, la tapa debe llamarse `Lid`.
