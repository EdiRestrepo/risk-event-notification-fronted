# Integracion de patrones en alertas simuladas

## Objetivo implementado

El dashboard simula alertas con la misma estructura esperada desde backend cada 20 segundos. Cada alerta se procesa coordinando los patrones:

```txt
Alerta simulada
  -> Strategy: clasifica tipo, color, prioridad y tiempo visible
  -> Observer: publica la alerta a los componentes suscritos
  -> Decorator: enriquece titulo y mensaje con AlertMessageBuilder
  -> Factory Method: crea canales segun codigos recibidos en content.channels
  -> Dashboard: renderiza el resultado con colores consistentes
```

En consola se imprime el orden de ejecucion:

```txt
[1/4 Strategy]
[2/4 Observer]
[3/4 Decorator]
[4/4 Factory Method]
```

## Tipos simulados

| Evento | eventType | Strategy | Color | Prioridad | Auto-close |
|---|---:|---|---|---|---:|
| Lluvia intensa | 1 | RainRiskAlertStrategy | NARANJA | ALTA | 5s |
| Inundacion / creciente | 2 | FloodRiskAlertStrategy | NARANJA | ALTA | 5s |
| Deslizamiento | 3 | LandslideRiskAlertStrategy | ROJO | CRITICA | 40s |
| Terremoto | 5 | EarthquakeRiskAlertStrategy | ROJO | CRITICA | 40s |
| Huracan | 6 | HurricaneRiskAlertStrategy | ROJO | CRITICA | 40s |
| Generica / informativa | 4 | DefaultRiskAlertStrategy | GRIS | BAJA | 5s |

## Mapeo de canales usado por Factory Method

El backend envia codigos numericos en `content.channels`. El servicio `AlertPatternIntegrationService` los traduce a los nombres usados por los creators ya existentes de Factory Method:

| Codigo backend | Canal Factory Method |
|---:|---|
| 1 | sms |
| 2 | email |
| 3 | push |
| 4 | whatsapp |

No se modificaron las clases de canales ni los concrete creators de Factory Method.

## Archivos agregados

```txt
src/services/behavioral/strategy/earthquake-risk-alert.strategy.ts
src/services/behavioral/strategy/hurricane-risk-alert.strategy.ts
src/services/behavioral/integration/alert-pattern-integration.service.ts
```

## Archivos modificados principales

```txt
src/services/notification.service.ts
src/services/facade/alert-center.facade.ts
src/services/models/risk-alert.model.ts
src/services/behavioral/strategy/alert-presentation-resolver.service.ts
src/services/behavioral/strategy/alert-presentation-strategy.interface.ts
src/services/behavioral/strategy/rain-risk-alert.strategy.ts
src/services/behavioral/strategy/flood-risk-alert.strategy.ts
src/services/behavioral/strategy/landslide-risk-alert.strategy.ts
src/services/behavioral/strategy/default-risk-alert.strategy.ts
src/components/dashboard.component.html
src/components/dashboard.component.css
```

## Validacion

Se valido la compilacion con:

```bash
npm run build
```

Resultado: compilacion exitosa.
