# Implementación de Patrones de Comportamiento: Simulación de Alertas

## Objetivo
Simular alertas del backend para demostrar los patrones **Observer** y **Strategy** funcionando correctamente con diferentes tipos de alertas.

## Requisitos

### 1. Simulación de Alertas
- Generar alertas cada 20 segundos (mientras no haya conexión real con backend)
- Las alertas desaparecen automáticamente a los 5 segundos (para demostración rápida)
- Estructura: usar contenido del backend (ver abajo), extraer `message` para que Strategy la interprete

### 2. Tipos de Alertas a Simular
Generar alertas variadas que disparen diferentes estrategias:
- **Lluvias intensas** → RainRiskAlertStrategy (NARANJA, 25s)
- **Deslizamientos** → LandslideRiskAlertStrategy (ROJO, CRITICA, 35s)
- **Inundaciones** → FloodRiskAlertStrategy (NARANJA, 30s)
- **Genérica/Informativa** → DefaultRiskAlertStrategy (GRIS, 20s)

### 3. Flujo Esperado
1. Sistema genera alerta simulada (estructura backend) → `pushAlert(alert)`
2. Observer (EventBus) publica → `notifySubscribers()`
3. Strategy resuelve presentación según `message` → `resolve(alert)` → `execute(alert)`
4. Dashboard recibe y renderiza diferenciado
5. Auto-close a los 5 segundos (tiempo fijo para simulación)

## Estructura de Alerta del Backend (Simulada)
```json
{
  "title": "Nueva alerta de riesgo",
  "content": {
    "id": "3f0b2d8e-6b2a-4f8f-9c35-2a8d1e9b7c11",
    "eventType": 1,
    "riskLevel": 3,
    "title": "Alerta por lluvias intensas",
    "message": "Se reportan lluvias intensas con posible riesgo de inundación en la zona.",
    "location": "Medellín - Valle de Aburrá",
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

**Mapeo a RealTimeAlert (interna):**
- `id` = `content.id`
- `message` = `content.message` (Strategy la analiza para elegir estrategia)
- `timestamp` = `content.createdAt`
- `simulated` = `true`

## Restricciones
- ❌ NO modificar Factory Method (NotificationChannelCreator)
- ❌ NO modificar Decorator (AlertMessageBuilder)
- ✅ Observer y Strategy deben trabajar visibles y coordinados
- ❌ NO implementar pruebas de aceptación

## Validación
- ✅ Alertas simuladas cada 20 segundos con estructura backend
- ✅ Cada alerta desaparece a los 5 segundos (5000ms fijo)
- ✅ Observer notifica: verificar en consola que `subscribers.update()` se invoca
- ✅ Strategy elige correcta: consola debe mostrar qué estrategia se usó
- ✅ Dashboard muestra alertas diferenciadas por tipo (colores, iconos, tiempos reales de Strategy)
