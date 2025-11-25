# Guía de Optimización de Performance

## Problemas Identificados

### 1. LCP (Largest Contentful Paint): 7.46s - POBRE
**Objetivo:** < 2.5s

**Causas principales:**
- Imágenes de productos sin optimizar (posiblemente muy pesadas)
- Productos sin imágenes causando intentos de carga fallidos
- Falta de preload para recursos críticos
- Sin priorización de carga de imágenes above-the-fold

### 2. CLS (Cumulative Layout Shift): 0.25 - POBRE
**Objetivo:** < 0.1

**Causas principales:**
- Imágenes sin dimensiones fijas causando shifts durante la carga
- El skeleton loader no reserva espacio correcto
- Animaciones hover y transiciones CSS

## Soluciones Implementadas

### ✅ Herramienta de Testing de Performance

Abre el navegador y usa la consola:

```javascript
// Ejecuta esto en la consola del navegador
const testPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('📊 Performance:', entry.name, entry);
    }
  });
  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

  // Verificar imágenes
  console.log('🖼️ Imágenes cargadas:', performance.getEntriesByType('resource').filter(r => r.initiatorType === 'img'));

  // Verificar requests fallidos
  console.log('❌ Network errors:', performance.getEntriesByType('resource').filter(r => r.transferSize === 0));
};
testPerformance();
```

### Chrome DevTools - Guía paso a paso

1. **Abrir Chrome DevTools**
   - Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

2. **Ir a la pestaña "Lighthouse"**
   - Click en "Generate report"
   - Selecciona "Performance" y "Desktop" o "Mobile"
   - Click "Analyze page load"

3. **Ir a la pestaña "Network"**
   - Habilita "Disable cache"
   - Recarga la página (`Ctrl+R`)
   - Busca recursos que:
     - Tienen status 404 (imágenes que no existen)
     - Tardan más de 1s en cargar
     - Son muy pesados (> 500KB para imágenes)

4. **Ir a la pestaña "Performance"**
   - Click en el botón de grabar (círculo)
   - Recarga la página
   - Detén la grabación
   - Busca:
     - "Layout Shift" (bloques amarillos)
     - "LCP candidate" (marca el elemento más grande)
     - Tiempos largos de parsing/scripting

## Tests Simples de Performance

### Test 1: Verificar imágenes rotas
```bash
# En tu terminal, ejecuta:
cd "c:\Users\guers\OneDrive\Escritorio\Front-TAB-V4\FrontEnd-TAB-main"
npm run dev
```

Luego en el navegador:
1. Abre DevTools → Network → Img
2. Recarga la página
3. Busca recursos con status 404 o errores

### Test 2: Medir velocidad de carga
```javascript
// En la consola del navegador:
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('⏱️ Tiempo total de carga:', (loadTime / 1000).toFixed(2) + 's');

  const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
  console.log('📄 DOM Ready:', (domReady / 1000).toFixed(2) + 's');
});
```

### Test 3: Analizar Web Vitals en tiempo real
```javascript
// Agregar temporalmente en main.tsx para logging:
const logWebVitals = () => {
  // LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('🎯 LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
    console.log('🖼️ Elemento LCP:', lastEntry.element);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('⚡ CLS acumulado:', clsValue.toFixed(3));
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });

  // FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('👆 FID:', entry.processingStart - entry.startTime, 'ms');
    }
  }).observe({ entryTypes: ['first-input'] });
};

// Ejecutar
logWebVitals();
```

## Checklist de Optimización

### Imágenes
- [ ] Todas las imágenes tienen fallback definido
- [ ] Placeholder predeterminado existe en `/public`
- [ ] Imágenes comprimidas (WebP preferible, < 200KB)
- [ ] Lazy loading para imágenes fuera del viewport inicial
- [ ] Dimensiones fijas para prevenir CLS

### Código
- [ ] Code splitting implementado
- [ ] Componentes pesados con lazy loading
- [ ] Bundle size < 500KB (gzipped)
- [ ] Recursos críticos con preload

### Fonts & CSS
- [ ] Fonts con font-display: swap
- [ ] CSS crítico inline
- [ ] Animaciones usando transform/opacity

## Métricas Objetivo

| Métrica | Actual | Objetivo | Acción |
|---------|--------|----------|--------|
| LCP | 7.46s | < 2.5s | Optimizar imágenes, preload |
| CLS | 0.25 | < 0.1 | Dimensiones fijas, skeleton mejorado |
| FID | ? | < 100ms | Revisar JS pesado |
| TTI | ? | < 3.8s | Code splitting |

## Recursos Útiles

- [Web Vitals Chrome Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Próximos Pasos

1. Instalar Web Vitals extension en Chrome
2. Ejecutar los tests de la consola
3. Identificar las 5 imágenes más pesadas
4. Comprimirlas con herramientas como:
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
   - ImageMagick: `magick convert input.jpg -quality 75 output.jpg`
5. Implementar las optimizaciones sugeridas en este proyecto
