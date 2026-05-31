# RecursoLink SC

**Marketplace inteligente de recursos empresariales para Santa Cruz, Bolivia**

Build With AI 2026 · Mención INDUSTRIA · GDG Santa Cruz

🌐 **Demo en vivo:** [https://hackaton-bice-gamma.vercel.app](https://hackaton-bice-gamma.vercel.app)

---

## Descripción

RecursoLink SC conecta empresas que tienen recursos ociosos (bodegas, maquinaria, transporte, personal especializado) con empresas que necesitan esos recursos, mediante **agentes de inteligencia artificial** que analizan, comparan y recomiendan la mejor opción considerando precio, ubicación, disponibilidad y condiciones comerciales.

### Problema

En Santa Cruz, miles de PyMEs tienen capacidad subutilizada mientras otras pierden semanas buscando recursos operativos por redes informales (WhatsApp, contactos personales).

### Solución

Plataforma B2B con agentes IA que:
1. Analizan la necesidad del solicitante en lenguaje natural
2. Evalúan ofertas disponibles con scoring multidimensional
3. Recomiendan top 5 opciones con explicación detallada

---

## Equipo

| Nombre | Rol | GitHub |
|--------|-----|--------|
| _[Completar]_ | Técnico | _[@usuario]_ |
| _[Completar]_ | Negocio | _[@usuario]_ |
| _[Completar]_ | Diseño/Validación | _[@usuario]_ |

---

## Arquitectura

```
Frontend (Next.js 16 + React 19 + Tailwind CSS 4)
    ↓
API Routes (/api/match, /api/listings)
    ↓
Agente IA (Google Gemini 2.0 Flash) + Scoring Engine
    ↓
Datos (Seed Santa Cruz + Store en memoria + localStorage cliente)
```

### Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **IA:** Google Gemini API (`gemini-2.0-flash`) + scoring algorithm propio
- **Mapas/Distancia:** Haversine con zonas de Santa Cruz
- **Deploy:** Vercel

---

## Instalación local

```bash
git clone https://github.com/TU_USUARIO/recursolink-sc.git
cd recursolink-sc
npm install
cp .env.example .env.local
# Agregar GEMINI_API_KEY en .env.local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Recomendada | API key de Google AI Studio para agentes IA |

> Sin API key, la plataforma funciona con motor de matching inteligente local (fallback).

---

## Uso

1. **Buscar con IA** (`/buscar`): Describe tu necesidad en lenguaje natural
2. **Publicar** (`/publicar`): Ofrece un recurso o publica una necesidad
3. **Empresas** (`/empresas`): Explora ofertas y necesidades activas
4. **Dashboard** (`/dashboard`): Métricas de impacto y modelo económico

---

## Modelo de negocio

- **Comisión:** 7% por transacción cerrada en plataforma
- **Suscripción Pro:** Plan mensual para empresas activas
- **Destacados:** Visibilidad premium en resultados
- **Proyección año 1:** Bs. 65.000 (~USD 9.300)

---

## Documentación adicional

- [Documento Técnico](./docs/DOCUMENTO_TECNICO.md)
- [Guión Pitch 2 min](./docs/PITCH_GUION.md)

---

## Licencia

Proyecto desarrollado para Build With AI 2026. Los participantes conservan la propiedad intelectual.
