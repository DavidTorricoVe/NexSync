# NexSync

**Marketplace inteligente de recursos empresariales** para Santa Cruz, Bolivia.

NexSync conecta empresas que tienen recursos ociosos (bodegas, maquinaria, transporte, personal) con empresas que los necesitan, usando un **agente de IA con Google Gemini** para analizar necesidades, comparar ofertas y cerrar contratos con facturación integrada.

**Demo en vivo:** [https://hackaton-bice-gamma.vercel.app](https://hackaton-bice-gamma.vercel.app)

**Repositorio:** [https://github.com/DavidTorricoVe/NexSync](https://github.com/DavidTorricoVe/NexSync)

---

## Problema

En Santa Cruz, miles de empresas tienen recursos que no usan al mismo tiempo que otras pierden semanas buscando exactamente esos recursos por WhatsApp y contactos personales.

- No hay visibilidad de qué recursos están disponibles cerca.
- La búsqueda manual es lenta y sin criterios claros.
- No existe un flujo comercial simple para contratar entre empresas.
- Se pierde tiempo, dinero y capacidad productiva.

---

## Solución

NexSync centraliza ofertas reales de empresas santa cruceñas y usa **Gemini** para entender la necesidad en lenguaje natural, rankear opciones y recomendar la mejor.

La plataforma permite:

- Buscar recursos con **IA** en `/buscar`.
- Publicar recursos disponibles en `/publicar`.
- Ver catálogo y mapas en `/empresas`.
- **Contratar** con términos, pago y factura digital.
- Recibir **notificaciones** cuando te contratan.
- Enviar **emails** de confirmación (Resend).
- Monitorear impacto en `/dashboard`.

---

## MVP actual

| Módulo | Ruta | Estado |
|--------|------|--------|
| Landing | `/` | ✅ |
| Agente IA Gemini | `/buscar` | ✅ |
| Publicar recurso + mapa | `/publicar` | ✅ |
| Catálogo y mapas | `/empresas` | ✅ |
| Dashboard impacto | `/dashboard` | ✅ |
| Login / Registro | `/login`, `/registro` | ✅ |
| Contrato + pago + factura | modal + `/factura/[id]` | ✅ |
| Notificaciones | campana navbar | ✅ |
| Emails Resend | API contratos | ✅ |
| Deploy Vercel | producción | ✅ |

**12 empresas demo** en zonas reales: Warnes, Plan 3000, Montero, Doble Vía, Equipetrol, etc.

---

## Funcionalidades principales

### 1. Agente IA de matching

Gemini analiza la necesidad, evalúa el catálogo real y devuelve ranking con puntuación 0–100 y explicación por oferta.

### 2. Catálogo y mapas

Mapas interactivos con Leaflet + OpenStreetMap. Distancia entre zona buscada y oferta.

### 3. Flujo comercial B2B

Selección → términos y condiciones → pago → factura. Comisión NexSync: **10%**.

### 4. Notificaciones y emails

El ofertante recibe alerta in-app y correo cuando lo contratan. Factura accesible desde la app.

### 5. Cuentas demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Contratante | `contrata@recursolink.sc` | `contrata1234` |
| Ofertante | `oferta@recursolink.sc` | `oferta1234` |
| General | `demo@recursolink.sc` | `demo1234` |

---

## Tecnologías usadas

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4**
- **Google Gemini API** (`gemini-2.5-flash`)
- **Resend** (emails)
- **Leaflet** (mapas)
- **JWT** (sesiones)
- **Vercel** (hosting)
- **GitHub**

---

## Arquitectura general

```
Usuario / Jurado
      ↓
NexSync Web App (Next.js)
      ↓
Vercel Hosting
      ↓
API Routes (/api/match, /api/contracts, /api/auth…)
      ↓
Gemini API + scoring + store en memoria
      ↓
Matching · Contratos · Notificaciones · Emails · Facturas
```

---

## Estructura del proyecto

```
NexSync/
├── docs/                              # Documentación para jurado
│   ├── NexSync_Documento_Tecnico.pdf
│   └── NexSync_Presentacion.pdf
├── public/                            # Logos e imágenes estáticas
│   ├── nexsync-logo.png
│   └── logo.jpg
├── scripts/                           # Scripts de soporte
│   └── create-git-history.sh
├── src/
│   ├── app/                           # Páginas, API routes y App Router
│   ├── components/                    # UI, mapas, contratos, modales
│   └── lib/                           # IA, auth, store, emails, config
├── .env.example                       # Plantilla de variables (sin API keys reales)
├── .gitignore
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Configuración local

### Opción A — Solo probar (recomendado)

Abre la demo en producción. **No necesitas API keys ni instalar nada:**

👉 [https://hackaton-bice-gamma.vercel.app](https://hackaton-bice-gamma.vercel.app)

Las credenciales (Gemini, Resend, auth) están configuradas en **Vercel** y no se publican en el código.

### Opción B — Correr en tu PC

```bash
git clone https://github.com/DavidTorricoVe/NexSync.git
cd NexSync
npm install
cp .env.example .env.local
```

Edita `.env.local` con **tus propias** keys (nunca las subas a GitHub):

```env
GEMINI_API_KEY=tu_key_de_google_ai_studio
AUTH_SECRET=secreto_largo_minimo_16_caracteres
RESEND_API_KEY=re_tu_key_opcional
RESEND_FROM=NexSync <onboarding@resend.dev>
PLATFORM_EMAIL=tu_correo@gmail.com
```

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

> **Gemini:** [Google AI Studio](https://aistudio.google.com/apikey) (gratis)  
> **Resend:** [resend.com/api-keys](https://resend.com/api-keys) (opcional, 100 emails/día)

---

## Seguridad de API keys

- Las keys **no van en el repositorio**.
- `.env.local` y `.env*` están en `.gitignore`.
- En producción las variables viven en **Vercel → Settings → Environment Variables**.
- Cualquier persona puede clonar el repo; para que la IA funcione en local debe crear su propio `.env.local`.
- La **demo pública** funciona en cualquier dispositivo sin configurar keys.

---

## Deploy

| Entorno | URL |
|---------|-----|
| **Producción** | [https://hackaton-bice-gamma.vercel.app](https://hackaton-bice-gamma.vercel.app) |
| **GitHub** | [https://github.com/DavidTorricoVe/NexSync](https://github.com/DavidTorricoVe/NexSync) |

Deploy automático desde `main` con Vercel.

---

## Flujo de demo recomendado

1. Abrir [https://hackaton-bice-gamma.vercel.app](https://hackaton-bice-gamma.vercel.app)
2. Ir a **Buscar con IA** → *"bodega refrigerada 300m² en Warnes"*
3. Contratar la mejor opción → términos → pago → factura
4. Login como **ofertante** (`oferta@recursolink.sc` / `oferta1234`)
5. Ver **notificación**: *"¡Te contrataron!"*
6. Mostrar `/empresas` (mapas) y `/dashboard`

---

## Propuesta de valor

NexSync reduce el tiempo de búsqueda de recursos empresariales en Santa Cruz y convierte capacidad ociosa en ingresos, con matching por IA y contrato digital en minutos.

**Usuarios objetivo:** PyMEs, agroindustrias, logística, talleres, bodegas y servicios en Santa Cruz.

---

## Modelo de negocio

B2B SaaS — **10% de comisión** por transacción cerrada en plataforma.

---

## Impacto esperado

- Menos tiempo buscando recursos.
- Mejor uso de bodegas, maquinaria y transporte ocioso.
- Más coordinación entre empresas locales.
- Decisiones basadas en datos e IA, no solo contactos.

---

## Diferenciadores

- Enfoque 100% Santa Cruz (zonas y empresas demo reales).
- Agente **Gemini real**, no respuestas fijas.
- Flujo completo: búsqueda → contrato → factura → notificación.
- Mapas en vivo con distancia entre oferta y necesidad.
- Demo funcional online sin instalar nada.

---

## Roadmap

### Próximas mejoras

- Base de datos persistente (Supabase / Firestore).
- Pagos reales (QR / pasarela local).
- Auth por empresa con roles.
- Historial de contratos por usuario.
- App móvil.

---

## Estado del MVP

| Etapa | Estado |
|-------|--------|
| Catálogo demo Santa Cruz | ✅ |
| Agente Gemini | ✅ |
| Contratos y factura | ✅ |
| Notificaciones + Resend | ✅ |
| Mapas Leaflet | ✅ |
| Deploy Vercel | ✅ |

---

## Equipo

Proyecto para **Hackathon Build With AI 2026** — **GDG Santa Cruz**.

| Integrante |
|------------|
| Diego Andrade |
| Sebastian Aspiazu |
| Salim Suarez |
| Mathias Frias |
| Daniel Roca |
| David Torrico |

---

## Documentación adicional

- [Documento técnico (PDF)](./docs/NexSync_Documento_Tecnico.pdf)
- [Presentación (PDF)](./docs/NexSync_Presentacion.pdf)

---

## Licencia

Proyecto desarrollado para Build With AI 2026. Los participantes conservan la propiedad intelectual.
