# Simulacion de alertas del backend

Esta version deja el frontend en modo simulacion mientras no exista comunicacion real con el backend.

## Comportamiento implementado

- `NotificationService` genera una alerta simulada inmediatamente al iniciar el dashboard.
- Luego genera una nueva alerta cada 20 segundos.
- El tiempo visible lo define el patron Strategy:
  - alertas naranjas/grises: 5 segundos;
  - alertas criticas rojas: 40 segundos.
- Las alertas simuladas respetan el contrato esperado del backend:

```json
{
  "title": "Nueva alerta de riesgo",
  "content": {
    "id": "3f0b2d8e-6b2a-4f8f-9c35-2a8d1e9b7c11",
    "eventType": 1,
    "riskLevel": 3,
    "title": "Alerta por lluvias intensas",
    "message": "Se reportan lluvias intensas con posible riesgo de inundacion en la zona.",
    "location": "Medellin - Valle de Aburra",
    "source": "SIATA",
    "createdAt": "2026-05-12T22:23:00",
    "expiresAt": "2026-05-13T02:23:00",
    "status": "Active",
    "instructions": [
      "Evite transitar por zonas inundables.",
      "No cruce quebradas o corrientes de agua."
    ],
    "channels": [1, 2, 3]
  }
}
```

## Patrones reflejados

### Observer

`NotificationService` publica las alertas en `RiskAlertEventBusService`. Los componentes consumen `alerts$` y se actualizan automaticamente mediante RxJS.

### Strategy

`AlertPresentationResolverService` decide que estrategia visual aplicar segun `eventType`, `riskLevel` y el contenido de la alerta:

- `RainRiskAlertStrategy`
- `FloodRiskAlertStrategy`
- `LandslideRiskAlertStrategy`
- `EarthquakeRiskAlertStrategy`
- `HurricaneRiskAlertStrategy`
- `DefaultRiskAlertStrategy`

### Decorator

`AlertPatternIntegrationService` usa el `AlertMessageBuilderService` ya existente para enriquecer el mensaje con nivel de riesgo, ubicacion, recomendacion, prioridad, fecha y lenguaje claro.

### Factory Method

Los codigos de `content.channels` se traducen a canales existentes del Factory Method:

- `1 -> sms`
- `2 -> email`
- `3 -> push`
- `4 -> whatsapp`

## Validacion por consola

Cada alerta simulada imprime el orden de coordinacion:

```txt
[1/4 Strategy]
[2/4 Observer]
[3/4 Decorator]
[4/4 Factory Method]
```

## Archivos principales modificados

- `src/services/models/risk-alert.model.ts`
- `src/services/notification.service.ts`
- `src/services/facade/alert-center.facade.ts`
- `src/services/behavioral/integration/alert-pattern-integration.service.ts`
- `src/services/behavioral/strategy/*`
- `src/components/dashboard.component.html`
- `src/components/dashboard.component.css`

No se modificaron las clases internas de Factory Method ni los decoradores concretos existentes.
