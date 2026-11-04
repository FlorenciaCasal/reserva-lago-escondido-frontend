# Sistema de Gestión de Visitas – Reserva Natural Lago escondido

Aplicación web desarrollada para la **gestión y control de visitas a una reserva natural**, con foco en la regulación de capacidad, la protección del entorno y la experiencia del visitante.

El sistema se encuentra actualmente **en producción** y cuenta con un **sitio público** y un **panel de administración con acceso restringido**.  
Está diseñado para crecer de forma progresiva incorporando nuevas funcionalidades a futuro.

🌐 Sitio en producción:  
https://www.reservalagoescondido.com.ar

---

## 🎯 Objetivo del sistema

- Regular el flujo de visitantes para preservar la flora y fauna del área protegida.
- Facilitar la gestión de reservas y capacidades diarias.
- Brindar una experiencia clara tanto para visitantes como para el personal de control.

---

## 🧭 Funcionalidades principales

### Sitio público
- Visualización de información general de la reserva.
- Gestión de reservas por parte de los visitantes.
- Página pública de detalle de reserva.
- Acceso a la ubicación mediante integración con **Google Maps**.

### Panel de administración (acceso restringido)
- Gestión de reservas, usuarios y disponibilidad.
- Visualización de reservas confirmadas por día.
- Control de capacidad diaria para evitar sobrecarga del área protegida.
- Gestión de excepciones por fecha:
  - Habilitación / deshabilitación de días específicos.
  - Habilitación / deshabilitación de meses completos.
- Filtros avanzados de reservas:
  - Estado
  - Fecha
  - DNI
  - Nombre
- Exportación de reservas a **Excel**.

---

## 🔐 Seguridad y autenticación

- Autenticación mediante **JWT almacenado en cookies HttpOnly**.
- Control de roles:
  - Administrador completo
  - Administrador con permisos limitados
- Acceso restringido al panel administrativo.

---

## 🧩 Arquitectura y tecnologías

### Frontend
- **Next.js** (App Router)
- **React**
- **TypeScript**
- Renderizado moderno orientado a performance y escalabilidad.

### Backend
- Integración con backend desarrollado en **Spring Boot**.
- Comunicación mediante **APIs REST**.

### Servicios externos
- Notificaciones transaccionales por **WhatsApp** mediante **Twilio** para:
  - Confirmación de visitas
  - Cancelación de reservas

---

## 🚀 Desarrollo local

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```
---

## 🛠 Operación: errores y modo mantenimiento

### 404 / Not Found
- El archivo `app/not-found.tsx` se muestra automáticamente cuando:
  - se accede a una ruta inexistente (404),
  - o cuando alguna página llama a `notFound()` (si se implementa).

No es necesario importarlo ni llamarlo manualmente.

### Modo mantenimiento (frontend)
- El sitio puede mostrarse en modo mantenimiento para evitar una experiencia rota durante despliegues o caídas del backend.

- **Variable de entorno (Vercel / local):**
  - `NEXT_PUBLIC_MAINTENANCE_MODE=true | false`

- **Comportamiento:**
  - Si `NEXT_PUBLIC_MAINTENANCE_MODE=true`, el `RootLayout` renderiza `MaintenancePage` y no carga el sitio normal.
  - Si es `false`, funciona normalmente.

- > Nota: el modo mantenimiento se activa de forma manual (no cambia automáticamente).




instagram:
Crear una nueva publicación en Instagram y seleccionar la foto.
En el texto de la publicación, pegar el Caption.
Debajo agregar el CTA.
Al final agregar los Hashtags con #.
En las opciones de accesibilidad de Instagram, cargar el Texto alternativo.
Revisar todo y publicar.