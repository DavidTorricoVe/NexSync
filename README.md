# NexSync

NexSync es una plataforma de **resiliencia operativa** para empresas de Santa Cruz ante crisis locales como bloqueos, cortes de energía, escasez de combustible, problemas logísticos o interrupciones de suministro.

El MVP funciona como un **Enterprise Resilience Command Center** que conecta empresas, recursos críticos, matching inteligente, contratos, alertas y una capa de **IA generativa (Gemini)** para apoyar decisiones operativas.

**Demo pública:** [https://hackaton-nexsync.web.app](https://hackaton-nexsync.web.app)

---

## Problema

Durante una crisis local, muchas empresas reaccionan de forma aislada:

- No saben qué empresas están en riesgo.
- No saben qué recursos críticos están disponibles.
- No tienen una forma rápida de coordinar apoyo operativo.
- Las decisiones se toman tarde, sin visibilidad compartida.
- La falta de coordinación puede generar pérdidas económicas y operativas.

---

## Solución

NexSync centraliza la información crítica en una consola operativa web con agentes de IA.

La plataforma permite:

- Monitorear empresas y recursos disponibles en Santa Cruz.
- Buscar recursos críticos con **agente Gemini** en lenguaje natural.
- Comparar ofertas con scoring multidimensional (precio, ubicación, disponibilidad).
- **Contratar recursos** con flujo de pago, facturación y términos legales.
- Generar **facturas in-app** y compartir contactos entre comprador y vendedor.
- Recibir **notificaciones** cuando tu empresa es contratada.
- Enviar **correos automáticos** de confirmación (Resend).
- Visualizar recursos en **mapas interactivos**.
- Cambiar entre vista pública, login y panel por empresa.

---

## MVP actual

El MVP incluye:

- Dashboard de impacto y KPIs operativos.
- Catálogo de empresas y recursos (Santa Cruz demo data).
- **Agente IA Gemini** para matching en `/buscar`.
- Publicación de recursos con mapa (`/publicar`).
- Autenticación empresarial (login / registro).
- Flujo de **contratación** con términos, pago y factura.
- **Campana de notificaciones** en tiempo real.
- **Factura digital** descargable / imprimible.
- Recursos contratados desaparecen del catálogo.
- Integración **Gemini API** para análisis y ranking.
- Integración **Resend** para emails de contrato.
- Deploy público en **Vercel**.

---

## Funcionalidades principales

### 1. Consola de operaciones

Muestra una vista general del estado operativo:

- Empresas monitoreadas.
- Recursos disponibles.
- Ofertas publicadas.
- Contratos registrados.
- Métricas de impacto regional.

### 2. Agente IA de matching

El agente Gemini:

- Analiza la necesidad en lenguaje natural.
- Busca en el catálogo real de empresas.
- Evalúa y rankea ofertas con explicación detallada.
- Recomienda las mejores opciones para contratar.

### 3. Flujo comercial B2B

- Selección de recurso → términos y condiciones → pago → facturación.
- Comisión de plataforma: **10%**.
- Contacto cruzado entre comprador y vendedor para logística.
- Notificación al ofertante: *"¡Te contrataron!"*.

### 4. Factura y coordinación

- Factura HTML profesional con datos de ambas partes.
- Exportable a PDF desde el navegador.
- Email opcional vía Resend al comprador, vendedor y plataforma.

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
- **Resend** (emails transaccionales)
- **Leaflet** (mapas interactivos)
- **JWT** (autenticación de sesión)
- **Vercel** (hosting)
- **GitHub** (control de versiones)

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
Gemini API + Motor de scoring + Store en memoria
      ↓
Matching · Contratos · Notificaciones · Emails · Facturas
```

---

## Estructura del proyecto

```
NexSync/
├── src/
│   ├── app/              # Páginas y API routes
│   ├── components/       # UI, mapas, modal de contrato
│   └── lib/              # IA, auth, store, emails, brand
├── public/
│   └── nexsync-logo.png
├── docs/
│   ├── DOCUMENTO_TECNICO.md
│   └── PITCH_GUION.md
├── scripts/
│   └── create-git-history.sh
├── .env.example          # Plantilla (no incluye secrets)
├── .gitignore
└── README.md
```

---

## Configuración local

```bash
git clone https://github.com/DavidTorricoVe/NexSync.git
cd NexSync
npm install
cp .env.example .env.local
```

Agregar en `.env.local`:

```env
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
AUTH_SECRET=secreto_largo_minimo_16_caracteres
RESEND_API_KEY=re_tu_key_opcional
RESEND_FROM=NexSync <onboarding@resend.dev>
PLATFORM_EMAIL=tu_correo@gmail.com
```

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Seguridad de API keys

Las API keys **no se suben a GitHub**.

Archivos excluidos vía `.gitignore`:

```
.env*
!.env.example
.vercel/
node_modules/
```

Para producción, las variables se configuran en **Vercel → Environment Variables**.

---

## Deploy

**URL de demo:** [https://hackaton-nexsync.web.app](https://hackaton-nexsync.web.app)

Deploy automático desde GitHub con Vercel.

---

## Flujo de demo recomendado

1. Abrir la landing de NexSync.
2. Iniciar sesión como **contratante** (`contrata@recursolink.sc`).
3. Ir a **Buscar con IA** → *"bodega refrigerada Warnes"*.
4. Contratar la mejor opción → aceptar términos → confirmar pago.
5. Ver **factura** y datos del vendedor.
6. Cerrar sesión → entrar como **ofertante** (`oferta@recursolink.sc`).
7. Revisar **campana de notificaciones**: *"¡Te contrataron!"*.
8. Mostrar dashboard de impacto y catálogo de recursos.

---

## Propuesta de valor

NexSync ayuda a empresas y operadores de infraestructura crítica a **coordinar recursos durante crisis locales**, reduciendo tiempos de respuesta, pérdidas operativas y decisiones aisladas.

El sistema puede ser usado por:

- Cámaras empresariales.
- Parques industriales.
- Empresas agroindustriales.
- Operadores logísticos.
- Empresas de energía.
- Empresas de agua.
- Municipios o centros de coordinación.

---

## Modelo de negocio

Modelo **B2B SaaS** orientado a empresas, asociaciones productivas y operadores de infraestructura crítica.

**Comisión:** 10% por transacción cerrada en plataforma.

Posibles planes:

- Plan empresa individual.
- Plan consorcio.
- Plan cámara/asociación.
- Plan enterprise con integración avanzada.

---

## Impacto esperado

NexSync busca reducir:

- Tiempo de respuesta ante crisis.
- Pérdidas por interrupción operativa.
- Falta de coordinación entre empresas.
- Duplicación de esfuerzos.
- Decisiones tomadas sin visibilidad de recursos disponibles.

También permite aumentar:

- Visibilidad operativa.
- Coordinación interempresarial.
- Uso eficiente de recursos críticos.
- Capacidad de respuesta ante crisis locales.
- Resiliencia de sectores productivos en Santa Cruz.

---

## Diferenciadores

- Enfoque local en problemáticas reales de Santa Cruz.
- Agente **Gemini** real (no respuestas predefinidas).
- Flujo comercial completo: búsqueda → contrato → factura → notificación.
- Vistas por empresa con autenticación.
- Mapas interactivos de recursos.
- Consola enterprise orientada a industria, logística, energía, agua y agro.

---

## Roadmap

### MVP actual

- Matching con Gemini.
- Contratos y facturación.
- Notificaciones y emails.
- Deploy en Vercel.

### Próximas mejoras

- Firebase Auth + Firestore persistente.
- Reglas por organización.
- Firebase Functions para Gemini.
- Métricas de impacto económico en tiempo real.
- Modelos predictivos de riesgo.
- Inyector de crisis para simulación de escenarios.
- Panel administrativo para operadores de consorcio.

---

## Estado del MVP

| Etapa | Estado |
|-------|--------|
| Catálogo y empresas demo | ✅ |
| Agente IA Gemini | ✅ |
| Contratos y factura | ✅ |
| Notificaciones | ✅ |
| Emails Resend | ✅ |
| Rebrand NexSync | ✅ |
| Deploy público | ✅ |

---

## Equipo

Proyecto desarrollado para la **Hackathon Build With AI 2026** organizada por **GDG Santa Cruz**.

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

- [Documento Técnico](./docs/DOCUMENTO_TECNICO.md)
- [Guión Pitch 2 min](./docs/PITCH_GUION.md)

---

## Licencia

Proyecto desarrollado para Build With AI 2026. Los participantes conservan la propiedad intelectual.
