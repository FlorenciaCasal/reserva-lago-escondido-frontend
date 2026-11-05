# Reserva Natural Lago Escondido - Frontend

Frontend público y panel administrativo de RNLE. Está construido con Next.js App Router y consume la API REST del backend Spring Boot.

## Stack

- Next.js 15.3.8
- Node.js 24 LTS recomendado; mínimo técnico: 18.18.0 (Next.js 15.3.8 también admite Node.js 20+)
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Hook Form, Yup, Framer Motion y Lucide React

## Funcionalidades

- Reservas de visitas, disponibilidad y consulta de reservas.
- Panel administrativo para usuarios, reservas, capacidad y disponibilidad.
- Home administrable, incluyendo Hero y proyectos destacados.
- Contenido público de Conservar, Habitar y Producir.
- Gestión de Proyectos, Avances, Novedades, documentos y galerías.
- Imágenes y videos de YouTube en contenido editorial.
- Generación asistida de contenido mediante OpenAI, a través del backend.
- Metadata SEO, Open Graph, JSON-LD, sitemap y robots.

## Desarrollo local

Requisitos: Node.js 24 LTS recomendado, o una versión compatible desde 18.18.0, npm y un backend accesible en `http://localhost:8080`.

El backend local debe permitir el origen del frontend mediante CORS. Para desarrollo, configurar el backend para aceptar el origen local utilizado por Next.js, normalmente `http://localhost:3000`.

```bash
npm ci
npm run dev
```

Validaciones:

```bash
npm run lint
npm run build
```

## Variables de entorno

Crear un `.env.local` local, sin versionarlo:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base pública del backend |
| `APP_ORIGIN` | Origen usado para URLs canónicas y metadata absoluta |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | Activa el modo mantenimiento del sitio |
| `ADMIN_USER` | Usuario de servicio server-only para consultas administrativas internas |
| `ADMIN_PASS` | Contraseña de servicio server-only para consultas administrativas internas |

En producción, las variables se configuran en Vercel. `ADMIN_USER` y `ADMIN_PASS` son exclusivamente server-only: nunca deben tener prefijo `NEXT_PUBLIC_`, exponerse al navegador ni incluirse en el repositorio. Nunca incluir tokens, cookies, claves ni contraseñas en el repositorio.

## Arquitectura

- Las páginas públicas viven en `src/app`.
- Los componentes reutilizables están en `src/components`.
- Las llamadas a la API están en `src/services` y `src/app/api`.
- La autenticación administrativa usa la cookie `auth_token`; el JWT no se expone al JavaScript del navegador.
- El Home obtiene contenido administrable del backend y utiliza una caché pública de aproximadamente 60 segundos.

## Subidas multimedia

Las subidas administrativas utilizan `src/services/mediaUpload.ts` y autorizaciones temporales para enviar los archivos directamente al backend, evitando el límite de payload de las funciones de Vercel.

- Imágenes: límite de 20 MiB.
- Documentos: límite de 10 MiB.
- Videos: límite de 50 MiB.
- Las imágenes grandes pueden redimensionarse a un máximo de 2560 px y convertirse a WebP en el navegador cuando reduce el tamaño transferido.
- El backend realiza la etapa final mediante ImageMagick, incluyendo la conversión, el procesamiento y la eliminación de metadatos EXIF, GPS, XMP e IPTC.

## SEO y despliegue

El sitio público es `https://www.reservalagoescondido.com.ar`. Vercel construye el proyecto desde la rama de producción. Revisar `APP_ORIGIN` y `NEXT_PUBLIC_API_URL` antes de publicar.

El sitio genera `robots.txt` y `sitemap.xml`. Las páginas administrativas no deben indexarse. Las páginas dinámicas de proyectos y novedades deben publicarse únicamente cuando el backend las marque como públicas.

El favicon se define mediante `src/app/icon.png`. Las imágenes estáticas se sirven desde `public`.

## Mantenimiento

Antes de publicar, ejecutar lint y build, revisar las variables de Vercel y probar login, reservas, Home, contenido editorial y subidas multimedia. No agregar backups, dumps, CSV, `.env` ni archivos de staging al repositorio.
