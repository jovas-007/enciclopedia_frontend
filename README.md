# Dragon Ball Enciclopedia — Frontend (Angular 16)

Este repositorio contiene el **frontend** de la enciclopedia de Dragon Ball. Está construido con **Angular 16.2.16**, consume la **Dragon Ball API** a través de un **proxy** de desarrollo (`/api → https://dragonball-api.com/api`) y se integra con un **backend Django** (pantalla basada en BD).

> **Objetivo**: ofrecer dos pantallas de personajes:
>
> 1. **API** (datos obtenidos en vivo desde `dragonball-api.com`), y
> 2. **BD** (datos servidos por el backend propio/Django).

---

## Tabla de contenido

* [Características](#características)
* [Stack y versiones](#stack-y-versiones)
* [Arquitectura del proyecto](#arquitectura-del-proyecto)
* [Integración con APIs](#integración-con-apis)
* [Requisitos previos](#requisitos-previos)
* [Instalación y ejecución](#instalación-y-ejecución)
* [Configuración por entornos](#configuración-por-entornos)
* [Scripts de NPM](#scripts-de-npm)
* [Rutas principales de la app](#rutas-principales-de-la-app)
* [Patrones de código](#patrones-de-código)
* [Manejo de errores, carga y vacíos](#manejo-de-errores-carga-y-vacíos)
* [Pruebas](#pruebas)
* [Build de producción y despliegue](#build-de-producción-y-despliegue)
* [Buenas prácticas y seguridad](#buenas-prácticas-y-seguridad)
* [Solución de problemas (FAQ)](#solución-de-problemas-faq)

---

## Características

* **Angular 16.2.16** (TypeScript \~5.1) con **RxJS 7.8**.
* **Proxy de desarrollo** para consumir la **Dragon Ball API** usando rutas relativas (`/api`).
* **Pantallas duales**:

  * **Personajes (API)**: listado + detalle consumiendo la API pública.
  * **Personajes (BD)**: listado + detalle obtenidos desde el backend Django (vía REST).
* **Enrutamiento** SPA con rutas dedicadas para cada pantalla.
* **CORS-friendly** en desarrollo: el proxy evita problemas con dominios cruzados.
* Preparado para **build de producción** (assets minificados, budgets de Angular).

## Stack y versiones

* **Node.js**: 18.19.0
* **npm**: 10.2.3
* **Angular CLI**: 16.2.16
* **Angular**: 16.2.16 (core, router, forms, etc.)
* **RxJS**: 7.8.x
* **zone.js**: 0.13.x

> Recomendado setear en `package.json` (campo `engines`) la versión de Node/npm para evitar diferencias de entorno.

## Arquitectura del proyecto

Estructura **orientativa** (puede variar según tu árbol actual):

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ core/                 # servicios singleton, modelos, interceptores
│  │  │  ├─ services/
│  │  │  │  ├─ dragon-ball-api.service.ts    # consume /api (proxy → API externa)
│  │  │  │  └─ backend.service.ts            # consume BACKEND_URL (Django)
│  │  │  └─ models/
│  │  │     └─ character.model.ts
│  │  ├─ features/
│  │  │  ├─ characters-api/     # componentes/páginas de la pantalla API
│  │  │  └─ characters-db/      # componentes/páginas de la pantalla BD
│  │  ├─ shared/                # componentes “tontos”, pipes, utilidades
│  │  ├─ app-routing.module.ts
│  │  └─ app.component.*
│  ├─ assets/
│  ├─ environments/
│  │  ├─ environment.ts
│  │  └─ environment.prod.ts
│  └─ index.html
├─ package.json
├─ angular.json
└─ proxy.conf.json
```

**Principios**

* **Separación de responsabilidades**: servicios para IO/HTTP, componentes para UI.
* **Tipado fuerte** con interfaces en `models/`.
* **Carpetas por feature** (API/BD) para encapsular vistas y lógica.

## Integración con APIs

### 1) Dragon Ball API (externa, pública)

* Dominio: `https://dragonball-api.com`
* Proxy de desarrollo definido en `proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://dragonball-api.com",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": { "^/api": "/api" },
    "logLevel": "debug"
  }
}
```

* En código **SIEMPRE** usar `/api/...` (no hardcodear el dominio).

Ejemplo de endpoint (referencial):

```
GET /api/characters
GET /api/characters/{id}
```

### 2) Backend Django (pantalla BD)

* Base URL configurable vía `environment.ts` (p. ej. `BACKEND_URL = 'http://localhost:8000'`).
* Exponer endpoints REST en Django para personajes (listado, detalle, búsqueda, etc.).
* **CORS**: asegurar que el backend permite `http://localhost:4200` en desarrollo.

## Requisitos previos

1. **Git** instalado.
2. **Node 18.19.0** y **npm 10.2.3** (usa `nvm`/`fnm` si manejas múltiples versiones).
3. **Angular CLI 16.2.16** global (opcional, pero recomendado):

   ```bash
   npm i -g @angular/cli@16.2.16
   ```
4. Backend Django corriendo (solo para la pantalla BD). No es necesario para la pantalla API.

## Instalación y ejecución

```bash
# 1) Instalar dependencias
npm ci    # usa package-lock.json para instalaciones reproducibles
# (o npm install si no tienes lock)

# 2) Levantar en desarrollo (puerto 4200 con proxy)
npm start
# → http://localhost:4200
```

> `npm start` internamente ejecuta: `ng serve --port 4200 --proxy-config proxy.conf.json`.

### Verificación rápida

* **Pantalla API**: navega a la ruta definida (ej. `/characters/api`). Deberías ver el listado viniendo de `/api`.
* **Pantalla BD**: navega a la ruta (ej. `/characters/db`). Debe consultar al backend Django.

## Configuración por entornos

Archivo `src/environments/environment.ts` (desarrollo):

```ts
export const environment = {
  production: false,
  backendBaseUrl: 'http://localhost:8000', // Django
  apiBasePath: '/api'                       // Proxy → Dragon Ball API
};
```

Archivo `src/environments/environment.prod.ts` (producción):

```ts
export const environment = {
  production: true,
  backendBaseUrl: 'https://TU_BACKEND_PROD',
  // Opción A (recomendada): consumir backend propio (BFF) que proxyee a la API externa
  apiBasePath: '/api' 
  // Opción B: llamar directo a https://dragonball-api.com/api si CORS lo permite
  // apiBasePath: 'https://dragonball-api.com/api'
};
```

> **Nota**: El `proxy.conf.json` solo aplica en **desarrollo**. En producción, usa tu backend como BFF o apunta `apiBasePath` al dominio externo (si CORS lo permite).

## Scripts de NPM

En `package.json`:

```json
{
  "scripts": {
    "start": "ng serve --port 4200 --proxy-config proxy.conf.json",
    "build": "ng build --configuration production",
    "build:dev": "ng build",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

> Ajusta los scripts a lo que tengas en tu proyecto. Si usas ESLint/Prettier, añade scripts de `lint`/`format`.

## Rutas principales de la app

Ejemplo (ajusta a tus nombres reales):

* `/` → Home / Dashboard
* `/characters/api` → Pantalla de personajes desde la **API** externa
* `/characters/db` → Pantalla de personajes desde la **BD** del backend
* `/characters/:id` → Detalle (puede resolverse según origen)

## Patrones de código

### Servicios HTTP (ejemplo referencial)

```ts
// dragon-ball-api.service.ts
@Injectable({ providedIn: 'root' })
export class DragonBallApiService {
  private readonly base = environment.apiBasePath; // '/api'
  constructor(private http: HttpClient) {}

  listCharacters(params?: { page?: number; limit?: number }): Observable<Character[]> {
    return this.http
      .get<Character[]>(`${this.base}/characters`, { params: params as any })
      .pipe(catchError(this.handleError));
  }

  getCharacter(id: string | number): Observable<Character> {
    return this.http
      .get<Character>(`${this.base}/characters/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: unknown) {
    // Centraliza log/telemetría aquí
    return throwError(() => err);
  }
}
```

### Componentes por feature

* **`characters-api/`**: componentes de UI para listar/buscar/ver detalle desde la API.
* **`characters-db/`**: componentes de UI para la fuente BD (servicio `backend.service.ts`).

## Manejo de errores, carga y vacíos

* **Cargas**: mostrar *spinners* o esqueletos mientras llegan datos.
* **Errores**: notificar con mensajes claros (p. ej., “No se pudo obtener personajes. Reintenta”).
* **Vacíos**: UI específica cuando `[]` o `null` (p. ej., “Sin resultados”).
* **Reintentos** (opcional): `retry({ count: 1 })` en observables críticos.

## Pruebas

* **Unitarias**: `ng test` (Jasmine + Karma por defecto).
* Cubre servicios (mock de `HttpClientTestingModule`) y componentes (render básico y estados de carga/error).

## Build de producción y despliegue

```bash
# Build optimizado (AOT, minificación, budgets)
npm run build
# Salida en: dist/<nombre-del-proyecto>
```

**Despliegue SPA**:

* Configurar **fallback 404 → index.html** en tu servidor (Netlify, Vercel, Apache, Nginx) para soportar *deep links*.
* Si en producción necesitas consumir la API externa, valida **CORS**. Alternativa: usar el backend Django como **BFF** y llamar siempre al backend.

## Buenas prácticas y seguridad

* **No** commitear llaves/secretos. Usa variables de entorno y archivos `environment.*` no sensibles.
* Tipar todas las respuestas HTTP (interfaces en `models/`).
* Evitar *any* y activar `"strict": true` en `tsconfig.json` (si el proyecto lo permite).
* No hardcodear dominios. Usar `environment` y el **proxy** en dev.
* Documentar rutas y contratos del backend (OpenAPI/Swagger si está disponible).

## Solución de problemas (FAQ)

**1) `npm start` no levanta / error de versiones**

* Verifica `node -v` → **18.19.x** y `npm -v` → **10.2.x**.
* Si usas `nvm`: `nvm use 18.19.0`.

**2)  CORS al pegarle a la BD (backend Django)**

* Asegura que el backend permita `http://localhost:4200` y métodos/headers necesarios.
* En desarrollo, las llamadas a la API externa deben pasar por `/api` (proxy).

**3) La API externa no responde / imágenes rotas**

* Reintenta o muestra UI de contingencia. Considera cachear resultados recientes en el backend.

**4) Puerto 4200 en uso**

* Ejecuta: `npm start -- --port=4300` o ajusta el script en `package.json`.

**5) Refrescar en una ruta profunda devuelve 404 en producción**

* Configura *SPA fallback* (rewrite) a `index.html` en tu hosting.

---

> **Tip**: si vas a documentar la pantalla BD en detalle, añade los endpoints reales (por ejemplo, `GET /api/characters/`, `GET /api/characters/:id/`) y ejemplos de payload para que otros devs puedan integrars
