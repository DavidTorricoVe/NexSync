# Documento Técnico — RecursoLink SC

**Build With AI 2026 · Mención INDUSTRIA · Santa Cruz, Bolivia**

---

## 1. Investigación y contexto

### 1.1 Problemática identificada

En el departamento de Santa Cruz existen más de 120.000 unidades económicas registradas (INE Bolivia, 2024), de las cuales el 95% son micro y pequeñas empresas. Un patrón recurrente es la **subutilización de activos operativos**:

- Bodegas y almacenes con capacidad ociosa (30-60% en promedio según cámaras empresariales)
- Maquinaria industrial utilizada parcialmente (turnos ociosos)
- Flota de transporte inactiva fines de semana
- Personal especializado con horas no facturadas

Simultáneamente, otras empresas invierten semanas buscando esos mismos recursos a través de redes informales (WhatsApp, contactos personales, ferias), sin comparación objetiva de precio, ubicación ni condiciones.

### 1.2 Usuario / beneficiario

| Actor | Necesidad | Beneficio |
|-------|-----------|-----------|
| **Empresa solicitante** | Resolver necesidad operativa rápido | Ahorro de tiempo y costos |
| **Empresa ofertante** | Monetizar capacidad ociosa | Ingreso adicional sin nuevo negocio |
| **Ecosistema regional** | Mejor aprovechamiento de recursos | Competitividad y sostenibilidad |

### 1.3 Contexto local Santa Cruz

- Hub industrial y agroindustrial del oriente boliviano
- Zonas clave: Warnes (agroindustria), Plan 3000 (manufactura), Doble Vía (logística), Montero (agro)
- Problemática verificable y exclusiva del departamento

---

## 2. Solución propuesta

**RecursoLink SC** es un marketplace B2B con agentes de inteligencia artificial que:

1. Permite publicar **ofertas** (recursos disponibles) y **necesidades** (recursos requeridos)
2. Analiza necesidades en lenguaje natural mediante agente IA
3. Compara ofertas con scoring multidimensional (precio, ubicación, disponibilidad, compatibilidad, condiciones)
4. Recomienda top 5 opciones con explicación en lenguaje natural

**No es caridad:** es intercambio comercial donde la empresa ofertante fija el precio y las condiciones.

---

## 3. Arquitectura tecnológica

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│  Landing │ Buscar IA │ Publicar │ Empresas │ Dashboard  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│                   API ROUTES (Node.js)                   │
│         /api/match          /api/listings               │
└────────────┬───────────────────────────┬────────────────┘
             │                           │
┌────────────▼────────────┐  ┌───────────▼───────────────┐
│   AGENTE IA (Gemini)    │  │   SCORING ENGINE (TS)     │
│  · Analizador necesidad │  │  · Precio (30%)           │
│  · Recomendador         │  │  · Ubicación (20%)        │
│  · Explicador resultados│  │  · Disponibilidad (15%)   │
└─────────────────────────┘  │  · Compatibilidad (25%)   │
                             │  · Condiciones (10%)      │
                             └───────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│              DATOS (Seed + Store + localStorage)         │
│  12 empresas demo · 14 listings · Zonas Santa Cruz      │
└─────────────────────────────────────────────────────────┘
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| IA | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Geolocalización | Haversine + zonas predefinidas Santa Cruz |
| Deploy | Vercel |
| Iconos | Lucide React |

---

## 4. Aplicación de Inteligencia Artificial

### 4.1 Agentes implementados

| Agente | Función | Input | Output |
|--------|---------|-------|--------|
| **Analizador de necesidad** | Extrae requisitos estructurados | Texto libre del usuario | JSON: tipo recurso, zona, presupuesto, urgencia, requisitos |
| **Evaluador de ofertas** | Scoring numérico | Necesidad + ofertas BD | Score 0-100 por dimensión |
| **Recomendador** | Explicación en lenguaje natural | Top matches + contexto | Resumen + explicación por opción |

### 4.2 Algoritmo de scoring

```
Score Total = (Precio × 0.30) + (Ubicación × 0.20) + (Disponibilidad × 0.15)
            + (Compatibilidad × 0.25) + (Condiciones × 0.10)
```

- **Precio:** Comparación con presupuesto máximo del solicitante
- **Ubicación:** Distancia Haversine entre zonas de Santa Cruz
- **Disponibilidad:** Alineación con urgencia declarada
- **Compatibilidad:** Match de tipo de recurso + análisis semántico
- **Condiciones:** Cumplimiento de requisitos obligatorios

### 4.3 Fallback inteligente

Sin API key de Gemini, el sistema opera con parser local + scoring completo, garantizando funcionalidad demo en todo momento.

---

## 5. Análisis FODA

| **Fortalezas** | **Debilidades** |
|----------------|-----------------|
| Agentes IA diferenciadores vs. directorios | Requiere masa crítica inicial de ofertas |
| Problema real y medible en Santa Cruz | Confianza entre empresas desconocidas |
| Modelo win-win-win (3 actores ganan) | Educación del mercado necesaria |
| MVP funcional con demo data realista | Persistencia limitada en MVP |

| **Oportunidades** | **Amenazas** |
|-------------------|--------------|
| 120.000+ unidades económicas en Santa Cruz | Competencia informal (WhatsApp, contactos) |
| Políticas de economía circular y sostenibilidad | Resistencia a pagar comisión |
| Expansión a Cochabamba, La Paz, Tarija | Regulación de pagos B2B digitales |
| Alianzas con cámaras empresariales (CAINCO, FEPC) | Copia del modelo por competidores |

---

## 6. Análisis PESTEL

| Factor | Impacto en RecursoLink SC |
|--------|--------------------------|
| **Político** | Apoyo gubernamental a digitalización PyME. Alianzas con cámaras empresariales. |
| **Económico** | Costos operativos altos → incentivo a compartir recursos. Dólar paralelo afecta pricing. |
| **Social** | Cultura empresarial en crecimiento. Networking local fuerte pero informal. |
| **Tecnológico** | Adopción creciente de IA y cloud en Bolivia. Penetración smartphone >80%. |
| **Ecológico** | Menos desperdicio de capacidad = menor huella (bodegas vacías, transporte ocioso). |
| **Legal** | Contratos B2B, facturación electrónica, protección de datos empresariales (Ley 164). |

---

## 7. Lean Canvas

| Bloque | Contenido |
|--------|-----------|
| **Problema** | Recursos empresariales ociosos + búsqueda ineficiente de soluciones operativas |
| **Solución** | Marketplace con agentes IA de matching y comparación |
| **Propuesta de valor** | Conectar en minutos lo que hoy toma semanas, con comparación inteligente |
| **Ventaja unfair** | Agentes IA + datos estructurados + enfoque hiperlocal Santa Cruz |
| **Segmentos** | PyMEs industriales, agroindustria, logística, servicios |
| **Canales** | CAINCO, FEPC, LinkedIn, ferias empresariales, boca a boca |
| **Métricas clave** | Matches/mes, tasa de cierre, GMV, NPS empresarial, tiempo de match |
| **Ingresos** | Comisión 7% + suscripción Pro Bs. 150/mes + destacados Bs. 50/publicación |
| **Costos** | Cloud (Vercel/Supabase), API Gemini, equipo comercial, soporte |
| **Estructura de costos** | 60% tech, 25% comercial, 15% operaciones |

---

## 8. Análisis financiero

### 8.1 Modelo de ingresos

| Fuente | Detalle | % ingresos |
|--------|---------|------------|
| Comisión por transacción | 7% sobre valor del intercambio | 60% |
| Suscripción Pro | Bs. 150/mes — publicaciones ilimitadas | 25% |
| Destacados | Bs. 50/publicación premium | 15% |

### 8.2 Unit Economics

```
Ticket promedio por match:        Bs. 3.500
Comisión plataforma (7%):         Bs. 245
Costo variable/transacción:       Bs. 35
Margen bruto/transacción:         Bs. 210 (86%)
```

### 8.3 Proyección financiera (conservadora)

| Período | Empresas | Matches/mes | Transacciones/mes | Ingreso mensual |
|---------|----------|-------------|-------------------|-----------------|
| Mes 3 | 30 | 8 | 4 | Bs. 980 |
| Mes 6 | 80 | 15 | 8 | Bs. 1.960 |
| Mes 12 | 250 | 60 | 35 | Bs. 8.575 |
| **Año 1 total** | — | — | — | **Bs. 65.000** |

### 8.4 Punto de equilibrio

- Costos fijos mensuales estimados: Bs. 2.500 (cloud, APIs, soporte)
- Transacciones necesarias para break-even: ~12/mes
- Alcanzable en mes 4-5 con estrategia comercial activa

---

## 9. Impacto esperado

| Indicador | Meta año 1 |
|-----------|------------|
| Recursos ociosos monetizados | 400+ publicaciones |
| Ahorro promedio solicitante | 25-40% vs. alternativa tradicional |
| Reducción tiempo de búsqueda | De ~2 semanas a < 24 horas |
| Ingresos adicionales ofertantes | Bs. 2.000-15.000/mes por recurso |
| Empleos indirectos | Empresas emergentes de servicios logísticos |

---

## 10. Próximos pasos

1. **Corto plazo (0-3 meses):** Validación con 20 empresas piloto en Santa Cruz
2. **Mediano plazo (3-6 meses):** Integración pagos B2B, contratos digitales, app móvil
3. **Largo plazo (6-12 meses):** Expansión Cochabamba/La Paz, API pública, marketplace API

---

*Documento preparado para Build With AI 2026 — RecursoLink SC*
