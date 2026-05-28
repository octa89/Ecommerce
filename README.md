# Peques & Maternity — Propuesta interactiva

Mockup-propuesta para Nidia (Peques & Maternity, Managua). Single-page HTML con extractor de URLs en vivo (SHEIN / Amazon / AliExpress), conversación WhatsApp animada con captura de datos, sub-tabs Instagram bidireccional, calculadora de costos Meta, y roadmap de pagos en cuotas.

## Stack

- HTML/CSS/JS estático — sin build step, sin frameworks
- 1 Serverless Function en Vercel (`/api/extract`) para extracción robusta de URLs con anti-bot
- Microlink + 3 CORS proxies públicos como fallback
- Google Fonts (Inter + JetBrains Mono + Dancing Script)
- Tema Claude (cream + amber + ink) + acentos Peques

## Deploy a Vercel

### Opción 1: CLI

```bash
npm i -g vercel
cd Ecommerce
vercel
# Seguí los prompts. Para producción: vercel --prod
```

### Opción 2: Conectar el repo de GitHub

1. Andá a https://vercel.com/new
2. Importá `github.com/octa89/Ecommerce`
3. Framework Preset: **Other**
4. Root Directory: `./`
5. Build Command: *vacío* (sin build)
6. Output Directory: *vacío*
7. Deploy

Vercel auto-detecta `/api/extract.js` como serverless function y lo deploya.

### Verificar después del deploy

- Abrí `https://<your-deploy>.vercel.app/` — redirige al mockup
- Andá al tab **Admin** → sub-section "Pegá-URL"
- Pegá `https://us.shein.com/goods-p-51233417.html` o cualquier URL de Amazon
- Si ves el banner verde **"Producto extraído en vivo vía /api/extract"** → la function está corriendo
- Si cae al fallback público (AllOrigins/etc.) → la function falló y el proxy chain la cubrió

## Resumen económico (los 3 tiers)

| Tier | Precio | Tiempo | Cuotas |
|---|---|---|---|
| 🎁 **Plantillas** (Gratis) | $0 · cortesía vecino | 3 días | — |
| 💎 **Esencial** | $1,200 USD | 3 semanas | 3 × $400 |
| 🚀 **Completo** | $3,000 USD | 6 semanas | 3 × $1,000 |

### Tier Esencial $1,200 incluye

- Todo lo del Tier Gratis
- Sitio público en peques.shop con catálogo + hero rotativo
- 🥇 **Pegá-URL** (SHEIN/Amazon/AliExpress → fotos + descripción + tallas en 3 segundos)
- 🥇 **Inventario en vivo** con alertas low-stock, historial, export Excel
- Bot WhatsApp por categoría con 3 productos relevantes por respuesta
- 🥇 **Reportes por email + analytics IG y WhatsApp** (diario/semanal/mensual a Nidia + designados)
- 🥇 **1 año todo incluido**: hosting (Vercel · Supabase · WhatsApp API · Sentry) · 10 hrs/mes de soporte acumulables · capacitación mensual para todo el equipo

### Tier Completo $3,000 incluye

- Todo lo del Tier Esencial
- 🥇 **Bot con IA** + handoff inteligente
- 🥇 **Pegá-URL avanzado** con backend dedicado (funciona al 100% en Amazon/SHEIN)
- 🥇 **Sync bidireccional con Instagram** (importás + publicás)
- E-commerce completo (carrito + checkout + notificaciones a WhatsApp)
- Analytics avanzado (dashboard productos + horas pico + conversión)

## Archivos del proyecto

```
Ecommerce/
├── Mockup_App_Peques_Maternity.html   # entregable principal (~270KB)
├── api/
│   └── extract.js                     # Vercel function para Pegá-URL robusto
├── vercel.json                        # config de deploy + headers + rewrites
├── README.md                          # este archivo
├── .gitignore
└── logo.png                           # opcional · fallback wordmark si no está
```

## Vendor / contacto

**Octavio · Geolink IT Solutions**
WhatsApp +505 8994 2459
Respondo en menos de 4 horas hábiles

## Notas técnicas

- El extractor `/api/extract` envía User-Agent de Chrome real → bypassa bloqueo básico de proxy detection
- Timeout 15s + redirect:follow + cache 1hr
- SSRF guard: bloquea localhost / IPs privadas
- En el cliente, la chain de extracción es: `/api/extract` → AllOrigins → CorsProxy.io → CodeTabs → Microlink (paralelo) → fallback curado con SVG placeholder
- Si la function falla en producción, los proxies públicos cubren — la demo nunca se queda sin imagen
- Mobile-first: probado a 375px y 380px
- `prefers-reduced-motion: reduce` honrado para todas las animaciones
