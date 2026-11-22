<p align="center">
  <img src="source/assets/logo.jpg" alt="PY.DEV" width="120">
</p>

<h1 align="center">PY.DEV — Ingresos y egresos</h1>

<p align="center">
  Landing de PY.DEV, la app para controlar tus ingresos y egresos desde el celular y la computadora.
</p>

<p align="center">
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-PolyForm%20Noncommercial%201.0.0-36C46C">
  <img alt="three.js" src="https://img.shields.io/badge/3D-three.js-0B100D">
  <img alt="Sitio estático" src="https://img.shields.io/badge/sitio-est%C3%A1tico-0B100D">
</p>

---

## Qué es

Una página estática, de un solo archivo, que presenta la app PY.DEV:

- **Hero 3D:** un celular y una laptop (modelos `.glb`) que muestran la app en funcionamiento: login, resumen, movimientos y reportes. Puedes girar el modelo arrastrándolo y cambiar de equipo con un botón.
- **Funciones de la app:** registro rápido, saldo en vivo, gastos por categoría y exportación a PDF y Excel.
- **Modo claro y oscuro:** respeta la preferencia del sistema y se puede cambiar con un botón.
- **Adaptada a celulares:** en pantallas táctiles el modelo gira solo y el dedo desplaza la página.
- **Para quién es:** freelancers, estudiantes, familias y pequeños negocios.
- Accesos directos para descargar la app y leer su documentación.

## Verla en tu computadora

No necesita instalación. Clona el repo y abre `index.html` en el navegador:

```bash
git clone https://github.com/Alexander-Dheins/fanpage_control_de_gastos_app.git
cd fanpage_control_de_gastos_app
```

Luego abre `index.html` con doble clic.

## Publicarla

Como es un sitio estático, sirve cualquier hosting de archivos. En **Vercel**:

1. Importa el repo en vercel.com → Add New → Project.
2. En **Framework Preset** elige *Other* y deja vacío el **Build Command**.
3. Pulsa **Deploy**. Cada `git push` a `main` vuelve a publicar la página.

## Estructura

```
├── index.html              Página lista para publicar (se genera con source/build.sh)
├── models/
│   ├── phone.glb           Celular: la pantalla es la malla "Screen"
│   └── laptop.glb          Laptop: pantalla "Screen" y tapa con bisagra "Lid"
├── source/                 Código fuente
│   ├── assets/logo.jpg     Logo de PY.DEV
│   ├── build-models.mjs    Construye los modelos .glb con three.js
│   ├── src/main.js         Escena 3D, controles y cambio de equipo
│   ├── src/screens.js      Dibuja la app animada dentro de las pantallas
│   ├── template.html       Plantilla de la página y sus secciones
│   └── build.sh            Regenera los modelos y el index.html
├── LICENSE.md              Licencia del proyecto
└── THIRD_PARTY_NOTICES.md  Licencias de terceros (three.js, fuentes)
```

## Modificarla

Requisitos: Node.js 18 o superior y Python 3.

```bash
cd source
npm install
npm run build
```

El comando vuelve a generar `models/*.glb` e `index.html`. Para cambiar textos o secciones, edita `source/template.html`. Para cambiar lo que se ve dentro de las pantallas, edita `source/src/screens.js`.

### Usar otro modelo 3D

1. Pon tu `.glb` en `models/` con el mismo nombre (`phone.glb` o `laptop.glb`).
2. Nombra la malla de la pantalla `Screen`. Si es la laptop, la tapa debe llamarse `Lid`.
3. En `source/build.sh`, borra las líneas `node build-models.mjs` y `cp phone.glb laptop.glb ...` para que no se sobrescriba tu modelo.
4. Ejecuta `npm run build`.

## Licencia

Copyright (c) 2026 Alexander-Dheins.

Este proyecto se distribuye bajo la **[PolyForm Noncommercial License 1.0.0](LICENSE.md)**. El código fuente es público, pero el uso está limitado a fines no comerciales.

| Puedes | No puedes |
| --- | --- |
| Ver, descargar y estudiar el código | Venderlo, solo o dentro de otro producto |
| Usarlo para fines personales, de estudio o investigación | Usarlo para ganar dinero, por ejemplo cobrando por instalarlo u ofrecerlo como servicio de pago |
| Modificarlo y compartir tus cambios sin fines de lucro, incluyendo la licencia y el aviso de copyright | Quitar la licencia o el aviso de copyright |

Si quieres usarlo con fines comerciales, escribe al autor para pedir una licencia aparte.

Las bibliotecas de terceros mantienen sus propias licencias; revisa [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
