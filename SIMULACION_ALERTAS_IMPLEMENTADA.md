# Simulación de Alertas - Implementación Completada

## Resumen
Se ha implementado la simulación de alertas del backend con la estructura real, demostrando los patrones **Observer** y **Strategy** funcionando coordinadamente.

## Cambios Realizados

### 1. NotificationService - Alertas Simuladas con Estructura Backend
**Archivo:** `src/services/notification.service.ts`

#### 1.1 Estructura de Alertas Simuladas
- Agregado array `simulatedBackendAlerts` con 4 tipos de alertas realistas:
  - **Lluvias intensas** → Dispara `RainRiskAlertStrategy` (NARANJA, 25s)
  - **Deslizamientos** → Dispara `LandslideRiskAlertStrategy` (ROJO, CRITICA, 35s)
  - **Inundaciones** → Dispara `FloodRiskAlertStrategy` (NARANJA, 30s)
  - **Genérica** → Dispara `DefaultRiskAlertStrategy` (GRIS, 20s)

#### 1.2 Mapeo Backend → RealTimeAlert
Cada alerta simulada mapea:
```
Backend structure → RealTimeAlert interna
├── content.id → alert.id
├── content.message → alert.message (Strategy la analiza)
├── content.createdAt → alert.timestamp
└── true → alert.simulated
```

#### 1.3 Método `emitSimulatedAlert()`
- ✅ Genera alertas aleatorias cada 20 segundos
- ✅ Estructura realista del backend
- ✅ Log del Observer Pattern

#### 1.4 Método `pushAlert()` Mejorado
- ✅ Log detallado del Strategy Pattern
- ✅ Muestra qué estrategia se eligió
- ✅ Muestra prioridad y tiempo auto-close
- ✅ Auto-close según `autoCloseMilliseconds` de Strategy

#### 1.5 Simulación Activada
- ✅ Descomentadas líneas en `startConnection()`
- ✅ Simulación se inicia cuando backend no está disponible
- ✅ Se detiene al conectar con backend real

### 2. RiskAlertEventBusService - Observable Pattern Visible
**Archivo:** `src/services/behavioral/observer/risk-alert-event-bus.service.ts`

#### 2.1 Método `notifySubscribers()` Mejorado
- ✅ Log que muestra:
  - Cantidad de suscriptores
  - Alertas activas
  - Detalles de cada alerta
- ✅ Invoca `update()` en cada observador

## Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────┐
│ CADA 20 SEGUNDOS: emitSimulatedAlert()                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 📡 [OBSERVER] Alerta publicada al EventBus             │
│ - Estructura backend parseada                          │
│ - message extraído para Strategy                       │
│ - Llamada a alertEventBus.publishAlert()               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 👥 [OBSERVER] Notificando N suscriptor(es)             │
│ - subscribers[].update(alerts) invocado                │
│ - Dashboard recibe nuevo estado                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 🎯 [STRATEGY] Estrategia resuelta                      │
│ - Strategy.canHandle(alert) evaluado                   │
│ - Strategy.execute(alert) llamado                      │
│ - ViewModel generado con:                             │
│   - Título diferenciado                               │
│   - Icono y color según tipo                          │
│   - Prioridad (CRITICA, ALTA, MEDIA, BAJA)           │
│   - autoCloseMilliseconds determinado                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Dashboard renderiza alerta diferenciada                │
│ (Async pipe suscrito a alertViewModels$)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ⏰ [AUTO-CLOSE] Después de autoCloseMilliseconds      │
│ - removeAlert() eliminada del EventBus                │
│ - Observadores notificados (alerta removida)          │
│ - Dashboard actualiza sin alerta                      │
└─────────────────────────────────────────────────────────┘
```

## Validación en Consola

Abrir Developer Tools (F12) → Console para ver:

### 1. Observer Pattern
```
📡 [OBSERVER] Alerta publicada al EventBus
  ID: 5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c
  Mensaje: Nivel del río Medellín en aumento - Creciente súbita potencial.
  Tipo: Alerta por inundación

👥 [OBSERVER] Notificando 1 suscriptor(es)
  Alertas activas: 1
  - 5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c: Nivel del río Medellín...
```

### 2. Strategy Pattern
```
🎯 [STRATEGY] Estrategia resuelta
  Alert ID: 5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c
  Mensaje analizado: Nivel del río Medellín en aumento...
  Estrategia seleccionada: Riesgo de inundación o creciente súbita
  Prioridad: ALTA
  Auto-close en: 30000 ms
  ViewModel: {...}
```

### 3. Alertas Generadas
```
🧪 [SIM] Alerta simulada generada: Alerta por lluvias intensas
🧪 [SIM] Alerta simulada generada: Alerta por deslizamiento
🧪 [SIM] Alerta simulada generada: Alerta por inundación
🧪 [SIM] Alerta simulada generada: Alerta informativa
```

### 4. Auto-cierre
```
⏰ [AUTO-CLOSE] Removiendo alerta: 5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c
```

## Características

✅ **Alertas cada 20 segundos**: Intervalo configurable en `startSimulation()`

✅ **Estructura Backend Realista**: Incluye:
- ID único
- Title, message, location
- Risk level y event type
- Created/expires timestamps
- Instructions y channels

✅ **Strategy Pattern Activo**: 
- Cada alerta dispara estrategia diferente
- ViewModel diferenciado por tipo
- Auto-close dinámico

✅ **Observer Pattern Visible**:
- Notificación explícita a suscriptores
- Logging de cambios de estado
- Coordinación con Strategy

✅ **Sin Modificaciones a Otros Patrones**:
- Factory Method intacto
- Decorator intacto
- Facade intacto

## Para Ir Más Lejos

### Cambiar Intervalo de Simulación
Editar en `notification.service.ts`, método `startSimulation()`:
```typescript
this.simulationInterval = setInterval(() => {
  this.emitSimulatedAlert();
}, 20000);  // ← Cambiar aquí (ms)
```

### Agregar Más Tipos de Alertas
Agregar elementos a `simulatedBackendAlerts` array con estructura backend.

### Conectar con Backend Real
SignalR en `receiveNotifications()` ya está listo. Al conectarse, la simulación se detiene automáticamente.
