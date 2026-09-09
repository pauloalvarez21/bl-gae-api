# Bl-GAE API

> **Español** · API en [NestJS](https://nestjs.com) que obtiene los resultados de **Baloto** y **Revancha** (Colombia) mediante scraping de [baloto.com/resultados](https://www.baloto.com/resultados), con caché en memoria y verificación de números jugados.
>
> **English** · [NestJS](https://nestjs.com) API that fetches **Baloto** and **Revancha** (Colombia) results by scraping [baloto.com/resultados](https://www.baloto.com/resultados), with in-memory caching and number verification.

## Características · Features

**ES**

- 📊 **Último resultado**: consulta el sorteo más reciente de Baloto y Revancha.
- 📜 **Histórico paginado**: navega por resultados históricos con paginación real (parámetros `page` y `limit`).
- ✅ **Verificación de jugadas**: compara tus números contra el último sorteo y determina la categoría de premio.
- ⚡ **Caché en memoria** (24 h para el histórico, 1 h global) para reducir el scraping.
- 🕐 **Tareas programadas**: actualización automática los días de sorteo (miércoles, viernes y sábado) y verificación horaria del caché.

**EN**

- 📊 **Latest result**: fetch the most recent Baloto and Revancha draw.
- 📜 **Paginated history**: browse historical results with real pagination (`page` and `limit` parameters).
- ✅ **Number verification**: compare your numbers against the latest draw and determine the prize category.
- ⚡ **In-memory cache** (24 h for history, 1 h global) to reduce scraping.
- 🕐 **Scheduled tasks**: automatic updates on draw days (Wednesday, Friday and Saturday) and hourly cache checks.

## Requisitos · Requirements

**ES**

- Node.js 20+ y npm

> 💡 El scraping se realiza con axios + cheerio (sin navegador). / Scraping is done with axios + cheerio (no browser required).

**EN**

- Node.js 20+ and npm

> 💡 Scraping is done with axios + cheerio (no browser required).

## Instalación y ejecución · Installation & running

**ES**

```bash
# Instalar dependencias
npm install

# Desarrollo (con watch)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

Por defecto escucha en el puerto `3000`, o en el definido por la variable de entorno `PORT`.

**EN**

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

It listens on port `3000` by default, or on the one set by the `PORT` environment variable.

**ES** — CORS está habilitado por defecto para cualquier origen (útil para Flutter web en desarrollo). Para restringirlo en producción, define la variable de entorno `CORS_ORIGIN` con la lista de orígenes separados por coma (ej: `https://miapp.com,https://admin.miapp.com`).

**EN** — CORS is enabled by default for any origin (useful for Flutter web in development). To restrict it in production, set the `CORS_ORIGIN` environment variable with a comma-separated list of origins (e.g. `https://myapp.com,https://admin.myapp.com`).

## Endpoints

Base URL / URL base: `http://localhost:3000`

### `GET /baloto/ultimo`

**ES** — Devuelve el último resultado de Baloto y de Revancha.
**EN** — Returns the latest Baloto and Revancha result.

**Respuesta 200 / Response 200:**

```json
{
  "baloto": {
    "sorteo": 1,
    "fecha": "5 de septiembre de 2026",
    "numeros": [11, 12, 17, 28, 31],
    "superbalota": 15
  },
  "revancha": {
    "sorteo": 2,
    "fecha": "5 de septiembre de 2026",
    "numeros": [3, 9, 22, 27, 40],
    "superbalota": 7
  }
}
```

Si no hay resultados, el campo correspondiente llega como `null`. / If there are no results, the corresponding field is `null`.

### `GET /baloto/historico?page=1&limit=10`

**ES** — Devuelve resultados históricos paginados.
**EN** — Returns paginated historical results.

| Parámetro / Parameter | Tipo / Type | Default | Validación / Validation | Descripción / Description |
|---|---|---|---|---|
| `page` | number | `1` | 1–125 | Página del histórico a consultar / History page to fetch |
| `limit` | number | `10` | 1–50 | Cantidad de resultados por página / Results per page |

**Respuesta 200 / Response 200:**

```json
{
  "baloto": [
    { "sorteo": 1, "fecha": "5 de septiembre de 2026", "numeros": [11, 12, 17, 28, 31], "superbalota": 15 }
  ],
  "revancha": [
    { "sorteo": 2, "fecha": "5 de septiembre de 2026", "numeros": [3, 9, 22, 27, 40], "superbalota": 7 }
  ],
  "paginacion": {
    "paginaActual": 1,
    "totalPaginas": 25,
    "resultadosPorPagina": 10
  }
}
```

> 💡 Los datos se cachean durante 24 horas. La paginación aplica sobre todos los resultados disponibles del scraping. / Data is cached for 24 hours. Pagination applies over all available scraped results.

### `GET /baloto/verificar`

**ES** — Verifica una jugada contra el último sorteo y determina si gana premio.
**EN** — Verifies a play against the latest draw and determines whether it wins a prize.

| Parámetro / Parameter | Tipo / Type | Validación / Validation | Descripción / Description |
|---|---|---|---|
| `numeros` | number[] | exactamente 5 números, 1–43 / exactly 5 numbers, 1–43 | Números principales de la jugada (se acepta separado por comas **o** repetido 5 veces) / Main numbers of the play (comma-separated **or** repeated 5 times) |
| `superbalota` | number | 1–16 | Número superbalota de la jugada / Superball number of the play |

Ambos formatos de `numeros` son válidos. / Both `numeros` formats are valid:

```
# Separado por comas / Comma-separated
?numeros=11,12,17,5,6&superbalota=15

# Parámetro repetido / Repeated parameter
?numeros=11&numeros=12&numeros=17&numeros=5&numeros=6&superbalota=15
```

**Respuesta 200 / Response 200:**

```json
{
  "numerosUsuario": {
    "numeros": [1, 2, 3, 4, 5],
    "superbalota": 15
  },
  "baloto": {
    "tipoSorteo": "Baloto",
    "ganador": false,
    "categoria": "Sin premio",
    "premio": 0,
    "aciertos": {
      "numeros": 2,
      "superbalota": false
    },
    "numerosGanadores": [11, 12, 17, 28, 31],
    "superbalotaGanadora": 15
  },
  "revancha": {
    "tipoSorteo": "Revancha",
    "ganador": false,
    "categoria": "Sin premio",
    "premio": 0,
    "aciertos": {
      "numeros": 0,
      "superbalota": false
    },
    "numerosGanadores": [3, 9, 22, 27, 40],
    "superbalotaGanadora": 7
  },
  "fecha": "5 de septiembre de 2026"
}
```

**Categorías de premio / Prize categories:**

| Aciertos / Hits | Superbalota | Categoría / Category | `premio` |
|---|---|---|---|
| 5 | ✓ | Premio Mayor / Jackpot | 1 |
| 5 | ✗ | Segundo Premio / Second Prize | 2 |
| 4 | ✓ | Tercer Premio / Third Prize | 3 |
| 4 | ✗ | Cuarto Premio / Fourth Prize | 4 |
| 3 | ✓ | Quinto Premio / Fifth Prize | 5 |
| 3 | ✗ | Sexto Premio / Sixth Prize | 6 |
| 0–2 | ✓ | Reintegro / Reimbursement | 7 |
| cualquier otro caso / any other case | — | Sin premio / No prize | 0 |

### `GET /`

**ES** — Endpoint raíz de prueba (scaffold de NestJS). Devuelve `Hello World!`.
**EN** — Test root endpoint (NestJS scaffold). Returns `Hello World!`.

### Errores · Errors

**ES** — Todos los endpoints de `/baloto/*` devuelven `500 Internal Server Error` si el scraping falla (por ejemplo, si no se encuentra el navegador o baloto.com no responde). Los parámetros inválidos en `/baloto/historico` y `/baloto/verificar` devuelven `400 Bad Request` gracias al `ValidationPipe` global.

**EN** — All `/baloto/*` endpoints return `500 Internal Server Error` if scraping fails (e.g. browser not found or baloto.com not responding). Invalid parameters on `/baloto/historico` and `/baloto/verificar` return `400 Bad Request` thanks to the global `ValidationPipe`.

## Tareas programadas · Scheduled tasks

| Horario (América/Bogotá) / Schedule (America/Bogota) | Frecuencia / Frequency | Descripción / Description |
|---|---|---|
| `23:35` | Miércoles, viernes y sábado / Wed, Fri & Sat | Actualiza los resultados tras el sorteo y refresca el caché / Updates results after the draw and refreshes the cache |
| Cada hora / Every hour | Todos los días / Every day | Verifica que el caché tenga datos (hace scraping si está vacío) / Checks the cache has data (scrapes if empty) |

## OpenAPI / Documentación · Documentation

**ES** — El archivo [`openapi.json`](./openapi.json) contiene la especificación OpenAPI 3.0 de la API, generada a partir del código real con `@nestjs/swagger`. Es útil para el frontend (generar clientes con OpenAPI Generator, Orval, openapi-typescript, etc.).

**EN** — The [`openapi.json`](./openapi.json) file contains the OpenAPI 3.0 specification of the API, generated from the real code with `@nestjs/swagger`. It is useful for the frontend (generate clients with OpenAPI Generator, Orval, openapi-typescript, etc.).

```bash
# Regenerar openapi.json tras modificar los endpoints / Regenerate openapi.json after changing endpoints
npm run generate:openapi
```

## Tests

```bash
# Tests unitarios / Unit tests
npm test

# Tests e2e
npm run test:e2e

# Cobertura / Coverage
npm run test:cov
```

## Fuente de datos · Data source

> **ES** — Los resultados de Baloto y Revancha se obtienen mediante scraping de la página pública de resultados de [baloto.com](https://www.baloto.com/resultados). Los datos son propiedad de sus respectivos dueños y se usan aquí solo con fines informativos. Este proyecto no está afiliado ni respaldado por Baloto ni por sus operadores. Si el sitio cambia su estructura o restringe el acceso, la API puede dejar de funcionar.
>
> **EN** — Baloto and Revancha results are fetched by scraping the public results page of [baloto.com](https://www.baloto.com/resultados). The data belongs to its respective owners and is used here for informational purposes only. This project is not affiliated with or endorsed by Baloto or its operators. If the site changes its structure or restricts access, the API may stop working.

## Licencia · License

> **ES** — Este proyecto es **código privado sin licencia** (`UNLICENSED` en `package.json`). Todos los derechos reservados: no se concede permiso para copiar, modificar, distribuir ni usar el código sin autorización previa del autor.
>
> **EN** — This project is **unlicensed private code** (`UNLICENSED` in `package.json`). All rights reserved: no permission is granted to copy, modify, distribute or use the code without prior authorization from the author.

## Estructura del proyecto · Project structure

```
src/
├── main.ts                    # Bootstrap + ValidationPipe global
├── app.module.ts              # Módulo raíz (ScheduleModule + CacheModule global) / Root module (ScheduleModule + global CacheModule)
├── app.controller.ts          # GET / (Hello World)
└── baloto/
    ├── baloto.module.ts       # Módulo Baloto / Baloto module
    ├── baloto.controller.ts   # Endpoints /baloto/*
    ├── baloto.service.ts      # Scraping, caché, verificación e histórico / Scraping, cache, verification & history
    ├── baloto-tasks/          # Tareas programadas (@nestjs/schedule) / Scheduled tasks (@nestjs/schedule)
    ├── interfaces/            # Tipos ResultadoBaloto / ResultadoRevancha y DTOs de respuesta / Result types & response DTOs
    ├── verificar/dto/         # Validación de la jugada (create-verificar.dto.ts) / Play validation (create-verificar.dto.ts)
    └── historico/dto/         # Validación de paginación (create-historico.dto.ts) / Pagination validation (create-historico.dto.ts)
```