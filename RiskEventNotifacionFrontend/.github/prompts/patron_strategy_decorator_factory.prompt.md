# Integración de Patrones: Strategy, Observer, Decorator y Factory Method

## Objetivo
Coordinar los 4 patrones de diseño para que las alertas simuladas se procesen y muestren correctamente en el dashboard con diferenciación visual.

## Tareas

### 1. Agregar 2 Nuevas Estrategias de Alerta
Crear estrategias para:
- **Terremoto** → EarthquakeRiskAlertStrategy (ROJO, CRITICA, 40s)
- **Huracán** → HurricaneRiskAlertStrategy (ROJO, CRITICA, 40s)

Agregar a `simulatedBackendAlerts` en NotificationService.

### 2. Integración Strategy + Observer + Decorator
Flujo sincronizado:
```
Alerta simulada → Strategy (selecciona estrategia) 
              → Observer (notifica suscriptores)
              → Decorator/AlertMessageBuilder (enriquece mensaje)
              → Dashboard (renderiza diferenciado)
```

Verificar en console.log que los 3 patrones se ejecutan en orden.

### 3. Integración Factory Method
Coordinar con los 3 patrones anteriores:
- Factory crea canales según alerta
- Strategy determina prioridad
- Observer notifica
- Decorator enriquece

No modificar Factory, solo asegurar coordinación.

### 4. Sincronizar Colores
Colores consistentes en todo el flujo:
| Tipo | Strategy | Decorator | Dashboard |
|------|----------|-----------|-----------|
| Lluvia | NARANJA | naranja | naranja |
| Inundación | NARANJA | naranja | naranja |
| Deslizamiento | ROJO | rojo | rojo |
| Terremoto | ROJO | rojo | rojo |
| Huracán | ROJO | rojo | rojo |
| Genérica | GRIS | gris | gris |

## Validación
- ✅ 6 tipos de alertas funcionando (incluir 2 nuevas)
- ✅ Console muestra: Strategy → Observer → Decorator en orden
- ✅ Dashboard muestra alertas con colores correctos
- ✅ Tiempos auto-close correctos según Strategy
- ✅ Factory Method crea canales correctamente
