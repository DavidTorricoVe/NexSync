#!/bin/bash
set -e
cd "$(dirname "$0")/.."

git init
git branch -M main

c() {
  if git diff --cached --quiet; then
    echo "⚠ skip vacío: $1"
    return
  fi
  git commit -m "$1"
}

# 1
git add .gitignore package.json package-lock.json tsconfig.json postcss.config.mjs eslint.config.mjs README.md .env.example
[ -f next.config.ts ] && git add next.config.ts
[ -f next.config.js ] && git add next.config.js
git add public/favicon.ico public/*.svg 2>/dev/null || true
c "chore: inicializar proyecto Next.js con Tailwind y configuración base"

# 2
git add src/lib/types.ts src/lib/zones.ts src/lib/seed-data.ts src/lib/scoring.ts
c "feat: agregar tipos, zonas de Santa Cruz y datos semilla"

# 3
git add src/lib/store.ts src/app/api/listings/route.ts src/components/ListingCard.tsx
c "feat: implementar catálogo de ofertas y API de listings"

# 4
git add src/lib/gemini.ts src/lib/ai-agent.ts src/app/api/match/route.ts src/app/api/ai-status/route.ts
c "feat: integrar agente Gemini para matching inteligente"

# 5
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx src/app/buscar/page.tsx \
  src/app/empresas/page.tsx src/app/dashboard/page.tsx src/app/publicar/page.tsx \
  src/components/Footer.tsx src/components/Navbar.tsx src/components/MatchResults.tsx src/components/UserMenu.tsx
c "feat: crear páginas principales, layout y resultados de búsqueda"

# 6
git add src/components/LocationMap.tsx src/components/LocationPickerMap.tsx src/components/EmpresasMapOverview.tsx
c "feat: agregar mapas interactivos Leaflet en ofertas y publicación"

# 7
git add src/lib/auth src/app/api/auth src/app/login/page.tsx src/app/registro/page.tsx
c "feat: añadir autenticación JWT con login y registro"

# 8
git add src/middleware.ts
c "feat: proteger rutas con middleware de sesión"

# 9
git add src/components/ContractModal.tsx src/app/api/contracts/route.ts src/lib/terms.ts
c "feat: flujo de contratación con términos, pago y facturación"

# 10
git add src/components/PaymentProcessing.tsx
c "feat: animación de procesamiento de pago con tarjeta"

# 11
git add src/lib/notifications.ts src/app/api/notifications/route.ts src/components/NotificationBell.tsx
c "feat: campana de notificaciones en tiempo real"

# 12
git add src/lib/email src/lib/invoice-utils.ts
c "feat: envío de correos de contrato con Resend"

# 13
git add src/lib/contracts-store.ts src/lib/contracts-client.ts \
  "src/app/api/contracts/[id]" src/app/factura \
  src/lib/store.ts src/lib/notifications.ts \
  src/app/api/contracts/route.ts src/components/ContractModal.tsx \
  src/components/MatchResults.tsx src/components/NotificationBell.tsx
c "feat: factura in-app y ocultar recursos ya contratados"

# 14
git add src/lib/brand.ts public/nexsync-logo.png \
  src/app/globals.css src/components/Navbar.tsx src/components/Footer.tsx \
  src/app/layout.tsx src/app/page.tsx src/components/InvoiceView.tsx \
  src/components/ContractModal.tsx src/components/PaymentProcessing.tsx \
  src/components/MatchResults.tsx src/app/buscar/page.tsx src/lib/terms.ts \
  src/lib/email src/lib/gemini.ts src/app/api/ai-status/route.ts \
  src/app/login/page.tsx src/app/dashboard/page.tsx
c "refactor: rebrand a NexSync con paleta corporativa y logo"

# 15
git add docs scripts/create-git-history.sh
c "docs: documento técnico, guion de pitch y script de historial git"

# rest
git add -A
c "chore: ajustes finales del repositorio"

echo ""
git log --oneline
