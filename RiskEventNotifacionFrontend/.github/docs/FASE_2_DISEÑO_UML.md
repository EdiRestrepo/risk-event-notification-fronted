# FASE 2: Justificación y Diseño UML de Patrones

**Fecha:** Mayo 22, 2026  
**Proyecto:** Risk Event Notification Frontend  
**Estado:** Fase de Diseño y Justificación

---

## Introducción

Este documento detalla el diseño UML para los dos patrones de comportamiento identificados en Fase 1:
1. **Chain of Responsibility** - Procesamiento de eventos de riesgo
2. **State** - Gestión del ciclo de vida de alertas

Cada patrón incluye diagramas UML, justificación SOLID y plan de integración con servicios Angular existentes.

---

# PATRÓN 1: CHAIN OF RESPONSIBILITY - Procesamiento de Eventos de Riesgo

## 1.1 Justificación Teórica

### Problema que Resuelve

El sistema necesita procesar eventos de riesgo a través de múltiples etapas:

```
Evento SIATA → Validación → Enriquecimiento → Análisis → Alerta → Canales → Envío
```

Sin un patrón claro:
- ❌ Cada etapa conocería a la siguiente (alto acoplamiento)
- ❌ Agregar una etapa requeriría modificar servicios existentes
- ❌ Testing de etapas individuales sería complejo
- ❌ No se podría cambiar el orden o saltarse pasos

### Cómo Chain of Responsibility Resuelve Esto

✅ **Desacoplamiento**: Cada handler solo conoce al siguiente, no a toda la cadena
✅ **Extensibilidad**: Nuevos handlers se agregan sin modificar código existente
✅ **Responsabilidad Única**: Cada handler hace UNA cosa
✅ **Flexibilidad**: Se pueden agregar/remover/reordenar handlers en runtime
✅ **Fail-Fast**: Un handler puede rechazar una solicitud sin pasar a la siguiente

### Cumplimiento de Principios SOLID

**S - Single Responsibility:**
- `RiskEventValidationHandler` → Solo valida eventos
- `RiskEventEnrichmentHandler` → Solo enriquece con datos
- `RiskLevelAnalysisHandler` → Solo analiza nivel de riesgo
- Cada clase tiene una razón para cambiar: su responsabilidad específica

**O - Open/Closed:**
- Abierto para extensión: Nuevo tipo de validación = nuevo handler (ej: `DuplicateEventDetectionHandler`)
- Cerrado para modificación: Los handlers existentes no se tocan
- El cliente (`RiskEventProcessingService`) no cambia

**L - Liskov Substitution:**
- Todos los handlers implementan `RiskEventHandler`
- Cualquier handler puede reemplazar a otro sin romper el sistema
- Las transiciones entre handlers funcionan igual

**I - Interface Segregation:**
- Interfaz `RiskEventHandler` es pequeña (solo `handle()` y `setNext()`)
- Los handlers no implementan métodos que no usan
- No hay métodos innecesarios

**D - Dependency Inversion:**
- `RiskEventProcessingService` depende de `RiskEventHandler` (abstracción)
- No depende de clases concretas (`ValidationHandler`, `EnrichmentHandler`, etc.)
- Las dependencias apuntan hacia arriba (hacia abstracciones)

---

## 1.2 Diagrama UML - Chain of Responsibility

```
┌──────────────────────────────────────────────┐
│          <<interface>>                       │
│        RiskEventHandler                      │
├──────────────────────────────────────────────┤
│ - nextHandler: RiskEventHandler              │
├──────────────────────────────────────────────┤
│ + handle(event: RiskEvent): void             │
│ + setNext(handler: RiskEventHandler): void   │
│ + hasNext(): boolean                         │
└──────────────────────────────────────────────┘
           ▲
           │ implements
           │
    ┌──────┴──────────────────────────────────────────────┐
    │                                                      │
┌───────────────────────────────────┐  ┌─────────────────────────────┐
│  AbstractRiskEventHandler         │  │  <<abstract>>               │
│  (BaseClass)                      │  │  AbstractRiskEventHandler   │
├───────────────────────────────────┤  │  (Alternativa)              │
│ # nextHandler: RiskEventHandler   │  │                             │
├───────────────────────────────────┤  │ # nextHandler               │
│ + setNext(handler): void          │  │ # handleInternal()          │
│ + passToNext(event: RiskEvent)    │  │ + handle(event)             │
│ + handle(event: RiskEvent)*       │  └─────────────────────────────┘
└───────────────────────────────────┘
           ▲
    ┌──────┴──────────────────────────────────────────────────────┐
    │         │         │         │         │         │           │
    │         │         │         │         │         │           │
    
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│RiskEventValidation │ │RiskEventEnrichment │ │RiskLevelAnalysis   │
│     Handler        │ │      Handler       │ │     Handler        │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│ - validator        │ │ - enricher         │ │ - analyzer         │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│ + handle(event)    │ │ + handle(event)    │ │ + handle(event)    │
│   - Valida schema  │ │   - Agrega datos   │ │   - Analiza riesgo │
│   - Chequea datos  │ │     geográficos    │ │   - Asigna nivel   │
│   - Rechaza si     │ │   - Geolocaliza    │ │   - Determina qué  │
│     inválido       │ │   - Agrega contexto│ │     usuarios afecta│
└────────────────────┘ └────────────────────┘ └────────────────────┘

┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│AlertGenerationHandler│ │ChannelSelection   │ │ Notification      │
│                    │ │     Handler        │ │   Dispatcher       │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│ - builder          │ │ - preferences      │ │ - notificationSvc  │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│ + handle(event)    │ │ + handle(event)    │ │ + handle(event)    │
│   - Construye      │ │   - Obtiene pref.  │ │   - Obtiene        │
│     alerta con     │ │     del usuario    │ │     creators       │
│     decoradores    │ │   - Selecciona     │ │   - Envía por      │
│   - Asigna ID      │ │     canales        │ │     canales        │
│   - Establece      │ │   - Válida acceso  │ │   - Registra envío │
│     timestamp      │ │     del usuario    │ │                    │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

### Descripción Detallada de Clases

#### 1. **RiskEventHandler** (Interfaz)

```typescript
interface RiskEventHandler {
  handle(event: RiskEvent): void;
  setNext(handler: RiskEventHandler): void;
  hasNext(): boolean;
  getNext(): RiskEventHandler;
}
```

**Responsabilidad:** Define el contrato que todos los handlers deben cumplir.

**Métodos:**
- `handle(event)`: Procesa el evento. Puede modificarlo o rechazarlo.
- `setNext(handler)`: Establece el siguiente handler en la cadena.
- `hasNext()`: Verifica si hay siguiente handler.
- `getNext()`: Obtiene el siguiente handler.

**Cumplimiento SOLID:**
- **Interface Segregation**: Solo los métodos necesarios
- **Dependency Inversion**: Abstracción para los clientes

---

#### 2. **AbstractRiskEventHandler** (Clase Base)

```typescript
abstract class AbstractRiskEventHandler implements RiskEventHandler {
  protected nextHandler: RiskEventHandler | null = null;

  setNext(handler: RiskEventHandler): void {
    this.nextHandler = handler;
  }

  hasNext(): boolean {
    return this.nextHandler !== null;
  }

  getNext(): RiskEventHandler {
    return this.nextHandler;
  }

  protected passToNext(event: RiskEvent): void {
    if (this.hasNext()) {
      this.nextHandler.handle(event);
    }
  }

  abstract handle(event: RiskEvent): void;
}
```

**Responsabilidad:** Implementa la lógica común (pasar a siguiente).

**Beneficios:**
- Los handlers concretos no repiten lógica de cadena
- Template Method pattern integrado
- Fácil para que un handler decida pasar o no pasar

---

#### 3. **RiskEventValidationHandler** (Concreto)

```typescript
class RiskEventValidationHandler extends AbstractRiskEventHandler {
  constructor(private validator: RiskEventValidator) {}

  handle(event: RiskEvent): void {
    try {
      // Valida estructura
      this.validator.validateSchema(event);
      
      // Valida datos requeridos
      this.validator.validateRequiredFields(event);
      
      // Valida rango de valores
      this.validator.validateDataTypes(event);
      
      // ✅ Válido, pasar al siguiente
      this.passToNext(event);
      
    } catch (error) {
      // ❌ Inválido, RECHAZAR (no pasar a siguiente)
      console.error(`Evento rechazado: ${error.message}`);
      // Opcional: registrar en sistema de auditoría
      event.status = 'REJECTED';
    }
  }
}
```

**Responsabilidad:** Validar que el evento cumple esquema y tipos de datos.

**Casos de Rechazo:**
- Evento sin campos obligatorios
- Tipos de datos incorrectos
- Valores fuera de rango esperado
- Formato inválido

---

#### 4. **RiskEventEnrichmentHandler** (Concreto)

```typescript
class RiskEventEnrichmentHandler extends AbstractRiskEventHandler {
  constructor(
    private geoService: GeoEnrichmentService,
    private contextService: ContextEnrichmentService
  ) {}

  handle(event: RiskEvent): void {
    try {
      // Enriquecer con geolocalización
      const location = this.geoService.getLocationInfo(event.latitude, event.longitude);
      event.location = location; // barrio, municipio, zona de riesgo, etc.

      // Enriquecer con contexto
      const context = this.contextService.getContext(event);
      event.context = context; // población afectada, historial similar, etc.

      // Enriquecer con datos de SIATA
      event.siataSource = this.geoService.getSIATAStationInfo(event.latitude, event.longitude);

      // Pasar al siguiente
      this.passToNext(event);

    } catch (error) {
      console.error(`Error en enriquecimiento: ${error.message}`);
      // Aún así pasar (enriquecimiento es best-effort)
      this.passToNext(event);
    }
  }
}
```

**Responsabilidad:** Agregar información adicional al evento.

**Enriquecimiento:**
- Geolocalización (barrio, zona, municipio)
- Población potencialmente afectada
- Historial de eventos similares
- Datos de estaciones SIATA más cercanas
- Información de infraestructura crítica cercana

---

#### 5. **RiskLevelAnalysisHandler** (Concreto)

```typescript
class RiskLevelAnalysisHandler extends AbstractRiskEventHandler {
  constructor(
    private riskAnalyzer: RiskAnalysisService,
    private userService: UserPreferencesService
  ) {}

  handle(event: RiskEvent): void {
    try {
      // Analizar nivel de riesgo
      const riskLevel = this.riskAnalyzer.calculateRiskLevel(event);
      event.riskLevel = riskLevel; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

      // Determinar usuarios afectados por geografía
      const affectedUsers = this.userService.getUsersByLocation(event.location);
      event.affectedUserIds = affectedUsers.map(u => u.id);

      // Determinad urgencia de distribución
      event.urgency = this.calculateUrgency(riskLevel);
      event.shouldBeImmediate = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

      // Pasar al siguiente
      this.passToNext(event);

    } catch (error) {
      console.error(`Error en análisis: ${error.message}`);
      // En error, marcar como MEDIUM (conservador)
      event.riskLevel = 'MEDIUM';
      this.passToNext(event);
    }
  }

  private calculateUrgency(riskLevel: string): number {
    const urgencyMap = {
      'CRITICAL': 1,
      'HIGH': 2,
      'MEDIUM': 3,
      'LOW': 4
    };
    return urgencyMap[riskLevel] || 3;
  }
}
```

**Responsabilidad:** Analizar el riesgo y determinar usuarios afectados.

**Análisis:**
- Calcular nivel de riesgo (basado en tipo, intensidad, ubicación)
- Determinar usuarios geográficamente afectados
- Establecer urgencia de distribución
- Flag para distribución inmediata (CRITICAL/HIGH)

---

#### 6. **AlertGenerationHandler** (Concreto)

```typescript
class AlertGenerationHandler extends AbstractRiskEventHandler {
  constructor(
    private alertService: AlertService,
    private alertBuilder: AlertMessageBuilderService
  ) {}

  handle(event: RiskEvent): void {
    try {
      // Usar patrón Builder + Decorator para construir alerta
      let alert = this.alertBuilder.buildBaseAlert(event);

      // Aplicar decoradores según contexto
      alert = this.alertBuilder
        .withRiskLevel(event.riskLevel)
        .withLocation(event.location)
        .withSafetyRecommendations(event.riskLevel)
        .withPriority(event.urgency)
        .withTimestamp()
        .withPlainLanguage()
        .build();

      // Persistir alerta
      const savedAlert = this.alertService.createAlert(alert);
      event.alert = savedAlert;

      // Pasar al siguiente
      this.passToNext(event);

    } catch (error) {
      console.error(`Error en generación de alerta: ${error.message}`);
      // Error crítico, no pasar
      event.status = 'FAILED';
    }
  }
}
```

**Responsabilidad:** Construir la alerta usando patrones Builder y Decorator.

**Construcción:**
- Base de alerta (evento + riesgo + ubicación)
- Decoradores (riesgo, ubicación, recomendaciones, prioridad, timestamp, lenguaje simple)
- Persistencia en base de datos
- Asignar ID y timestamp

---

#### 7. **ChannelSelectionHandler** (Concreto)

```typescript
class ChannelSelectionHandler extends AbstractRiskEventHandler {
  constructor(private userPreferencesService: UserPreferencesService) {}

  handle(event: RiskEvent): void {
    try {
      const selectedChannels = {};

      // Para cada usuario afectado
      for (const userId of event.affectedUserIds) {
        const preferences = this.userPreferencesService.getPreferences(userId);
        
        // Aplicar lógica de selección
        const userChannels = this.selectChannels(preferences, event.riskLevel);
        selectedChannels[userId] = userChannels;
      }

      event.channelsByUser = selectedChannels;

      // Pasar al siguiente
      this.passToNext(event);

    } catch (error) {
      console.error(`Error en selección de canales: ${error.message}`);
      // En error, usar canales por defecto (conservador)
      event.channelsByUser = this.getDefaultChannels(event.affectedUserIds);
      this.passToNext(event);
    }
  }

  private selectChannels(preferences: UserPreferences, riskLevel: string): string[] {
    const channels: string[] = [];

    // Lógica: mayor riesgo = más canales
    if (riskLevel === 'CRITICAL') {
      // Usar todos los canales activos
      if (preferences.channels.sms) channels.push('SMS');
      if (preferences.channels.email) channels.push('EMAIL');
      if (preferences.channels.push) channels.push('PUSH');
      if (preferences.channels.whatsapp) channels.push('WHATSAPP');
    } else if (riskLevel === 'HIGH') {
      // Al menos SMS + Push
      if (preferences.channels.sms) channels.push('SMS');
      if (preferences.channels.push) channels.push('PUSH');
      // Agregar otros si están disponibles
      if (preferences.channels.whatsapp) channels.push('WHATSAPP');
    } else if (riskLevel === 'MEDIUM') {
      // Respeta preferencias del usuario
      if (preferences.channels.sms) channels.push('SMS');
      if (preferences.channels.push) channels.push('PUSH');
    } else {
      // LOW: Solo canales preferidos
      if (preferences.channels.email) channels.push('EMAIL');
      if (preferences.channels.push) channels.push('PUSH');
    }

    return channels.length > 0 ? channels : ['PUSH']; // Default: Push
  }

  private getDefaultChannels(userIds: string[]): { [key: string]: string[] } {
    const result = {};
    userIds.forEach(userId => {
      result[userId] = ['PUSH']; // Canal por defecto
    });
    return result;
  }
}
```

**Responsabilidad:** Seleccionar canales según preferencias del usuario y nivel de riesgo.

**Lógica:**
- Riesgo CRITICAL: Todos los canales
- Riesgo HIGH: SMS + Push + otros
- Riesgo MEDIUM: Respeta preferencias
- Riesgo LOW: Canales preferidos
- Default: PUSH si hay error

---

#### 8. **NotificationDispatcherHandler** (Concreto)

```typescript
class NotificationDispatcherHandler extends AbstractRiskEventHandler {
  constructor(
    private notificationService: NotificationService,
    private channelFactory: NotificationChannelCreatorFactory,
    private auditService: AuditService
  ) {}

  handle(event: RiskEvent): void {
    const sendPromises: Promise<any>[] = [];

    try {
      // Para cada usuario y sus canales
      for (const [userId, channels] of Object.entries(event.channelsByUser)) {
        for (const channelName of channels) {
          // Obtener el creator del canal
          const creator = this.channelFactory.getCreator(channelName);
          const channel = creator.createChannel();

          // Obtener el receptor (email, teléfono, etc.)
          const recipient = this.notificationService.getUserContact(userId, channelName);

          // Enviar de forma asíncrona
          const promise = channel.send(event.alert.message, recipient)
            .then(() => {
              // Registrar envío exitoso
              this.auditService.logSent(userId, channelName, event.alert.id);
            })
            .catch((error) => {
              // Registrar fallo pero continuar
              console.error(`Fallo enviando por ${channelName} a ${userId}: ${error}`);
              this.auditService.logFailed(userId, channelName, event.alert.id, error);
            });

          sendPromises.push(promise);
        }
      }

      // Esperar a que se envíen (con timeout)
      Promise.allSettled(sendPromises)
        .then(() => {
          event.status = 'DISPATCHED';
          this.passToNext(event);
        })
        .catch((error) => {
          console.error(`Error en despacho: ${error}`);
          event.status = 'PARTIALLY_DISPATCHED';
          this.passToNext(event);
        });

    } catch (error) {
      console.error(`Error crítico en despacho: ${error.message}`);
      event.status = 'FAILED';
    }
  }
}
```

**Responsabilidad:** Enviar notificaciones por canales seleccionados.

**Envío:**
- Usar Factory Method para crear canales
- Envío asincrónico paralelo
- Auditoría de envíos (exitoso/fallido)
- Manejo robusto de errores

---

## 1.3 Servicio Orquestador - RiskEventProcessingService

```typescript
@Injectable({ providedIn: 'root' })
class RiskEventProcessingService {
  private pipeline: RiskEventHandler;

  constructor(
    private validationHandler: RiskEventValidationHandler,
    private enrichmentHandler: RiskEventEnrichmentHandler,
    private analysisHandler: RiskLevelAnalysisHandler,
    private generationHandler: AlertGenerationHandler,
    private channelHandler: ChannelSelectionHandler,
    private dispatcherHandler: NotificationDispatcherHandler
  ) {
    // Construir la cadena
    this.pipeline = this.buildPipeline();
  }

  private buildPipeline(): RiskEventHandler {
    this.validationHandler.setNext(this.enrichmentHandler);
    this.enrichmentHandler.setNext(this.analysisHandler);
    this.analysisHandler.setNext(this.generationHandler);
    this.generationHandler.setNext(this.channelHandler);
    this.channelHandler.setNext(this.dispatcherHandler);

    return this.validationHandler;
  }

  // Procesa un evento a través de toda la cadena
  processRiskEvent(event: RiskEvent): void {
    console.log(`Iniciando procesamiento de evento: ${event.id}`);
    this.pipeline.handle(event);
  }

  // Permite reconfigurar la cadena en runtime (ej: agregar análisis adicional)
  insertHandler(handler: RiskEventHandler, position: number): void {
    // Lógica para insertar handler en posición específica
    // Útil para agregar validaciones o análisis adicionales
  }
}
```

**Responsabilidad:** Construir y orquestar la cadena.

**Ventajas:**
- Punto único de configuración de la cadena
- Fácil de testear
- Permite reconfiguración en runtime

---

## 1.4 Integración con Servicios Existentes

### Diagrama de Integración

```
RiskEventProcessingService (NUEVO)
  │
  ├─→ [CADENA DE HANDLERS]
  │     ├─→ ValidationHandler (NUEVO) → RiskEventValidator (NUEVO)
  │     ├─→ EnrichmentHandler (NUEVO) → GeoEnrichmentService (NUEVO)
  │     ├─→ AnalysisHandler (NUEVO) → RiskAnalysisService (NUEVO)
  │     ├─→ GenerationHandler (NUEVO) → AlertService (EXISTENTE)
  │     │                              → AlertMessageBuilderService (EXISTENTE)
  │     ├─→ ChannelSelectionHandler (NUEVO) → UserPreferencesService (EXISTENTE)
  │     └─→ DispatcherHandler (NUEVO) → NotificationService (EXISTENTE)
  │                                   → NotificationChannelCreatorFactory (EXISTENTE)
  │
  └─→ NotificationService (EXISTENTE)
      └─→ Emite eventos completados
```

### Cambios Mínimos a Servicios Existentes

**UserPreferencesService:**
- ✅ Ya existe
- ✅ Solo necesita un nuevo método: `getPreferences(userId): UserPreferences`

**NotificationService:**
- ✅ Ya existe
- ✅ Solo necesita: `getUserContact(userId, channelName): string`

**AlertService & AlertMessageBuilderService:**
- ✅ Ya existen (Patrón Decorator implementado)
- ✅ Solo necesita: `createAlert(alert): Alert`

**NotificationChannelCreatorFactory:**
- ✅ Ya existe (Factory Method implementado)
- ✅ Será usado por DispatcherHandler

---

## 1.5 Casos de Uso - Chain of Responsibility

### Caso 1: Evento de Inundación Validado Correctamente

```
SIATA emite: { latitude: 6.2442, longitude: -75.5898, type: 'FLOOD', intensity: 8 }
  ↓
RiskEventValidationHandler
  ✓ Datos completos
  ✓ Tipos correctos
  ↓ PASAR
RiskEventEnrichmentHandler
  + Ubicación: "La América, Medellín"
  + Población afectada: ~15,000
  + Historial: Similar hace 2 años
  ↓ PASAR
RiskLevelAnalysisHandler
  + Nivel: CRITICAL
  + Usuarios afectados: [user1, user2, ..., user1234]
  + Urgencia: 1 (IMMEDIATAMENTE)
  ↓ PASAR
AlertGenerationHandler
  + Crear alerta: "CRÍTICA: Inundación en La América..."
  + Con recomendaciones de seguridad
  + Guardar en BD
  ↓ PASAR
ChannelSelectionHandler
  + user1: [SMS, PUSH, WHATSAPP] (prefiere todos)
  + user2: [PUSH] (prefiere solo push)
  + user3: [SMS, EMAIL] (prefiere correo)
  ↓ PASAR
NotificationDispatcherHandler
  ✓ SMS a user1
  ✓ PUSH a user1, user2
  ✓ WHATSAPP a user1
  ✓ EMAIL a user3
  ↓
RESULTADO: Todos recibieron alertas por sus canales preferidos
```

### Caso 2: Evento Inválido - Falla Temprana

```
SIATA emite: { latitude: null, longitude: null, type: 'UNKNOWN' }
  ↓
RiskEventValidationHandler
  ❌ Datos incompletos (latitude/longitude faltantes)
  ❌ Tipo no reconocido
  ⚠️ RECHAZAR - NO PASAR
  
RESULTADO: Evento rechazado, no se procesan más etapas
         Menor uso de recursos ✓
         Sin alertas falsas ✓
```

### Caso 3: Agregar Nueva Validación en Runtime

```
Problema: "¿Cómo evitamos alertas duplicadas?"

Solución: Agregar DuplicateDetectionHandler
  - Verificar si evento similar fue procesado hace poco
  - Si es duplicado, rechazar
  
El servicio:
pipeline.insertHandler(
  new DuplicateDetectionHandler(alertService),
  1 // Posición: después de validación, antes de enriquecimiento
);

✓ No requiere cambiar validationHandler
✓ No requiere cambiar enrichmentHandler
✓ Lógica aislada en una clase
```

---

## 1.6 Ventajas de Chain of Responsibility en Este Contexto

| Ventaja | Ejemplo |
|---------|---------|
| **Desacoplamiento** | ValidationHandler no conoce a EnrichmentHandler |
| **Extensibilidad** | Agregar DuplicateDetectionHandler sin modificar nada |
| **Fail-Fast** | Evento inválido no gasta recursos en enriquecimiento |
| **Testing** | Probar ValidationHandler aisladamente |
| **Configurabilidad** | Cambiar orden de handlers en runtime |
| **Responsabilidad Única** | Cada handler hace UNA cosa |
| **Reutilización** | Los handlers pueden usarse en otros pipelines |

---

# PATRÓN 2: STATE - Gestión del Ciclo de Vida de Alertas

## 2.1 Justificación Teórica

### Problema que Resuelve

Una alerta tiene un **ciclo de vida complejo** con múltiples estados donde el comportamiento cambia según el estado actual:

```
NUEVA → VALIDADA → EN_DISTRIBUCIÓN → DISTRIBUIDA → RESPONDIDA → RESUELTA → ARCHIVADA
```

En cada estado:
- ✓ Qué acciones permitir (resendear, editar, archivar)
- ✓ Qué información mostrar a usuarios
- ✓ Qué transiciones son válidas
- ✓ Qué comportamientos ejecutar

Sin un patrón claro:
- ❌ Múltiples `if-else` checando `alert.status`
- ❌ Lógica esparcida en diferentes servicios
- ❌ Transiciones inválidas posibles
- ❌ Difícil agregar nuevos estados

### Cómo State Resuelve Esto

✅ **Encapsulación**: Cada estado encapsula su comportamiento
✅ **Transiciones Claras**: Solo estados válidos pueden transicionar
✅ **Lógica Localizada**: Toda la lógica de un estado en una clase
✅ **Extensibilidad**: Nuevo estado = nueva clase
✅ **Seguridad**: Impide transiciones inválidas
✅ **Testeable**: Cada estado se prueba independientemente

### Cumplimiento de Principios SOLID

**S - Single Responsibility:**
- `AlertNewState` → Comportamiento para alertas nuevas
- `AlertDistributedState` → Comportamiento para alertas distribuidas
- Cada clase tiene una razón para cambiar: el comportamiento de su estado

**O - Open/Closed:**
- Abierto para extensión: Nuevo estado = nueva clase
- Cerrado para modificación: Estados existentes no cambian
- `Alert` (context) no cambia

**L - Liskov Substitution:**
- Todos los estados implementan `AlertState`
- Cualquier estado puede reemplazar a otro sin romper el sistema
- Las operaciones en `Alert` funcionan igual

**I - Interface Segregation:**
- Interfaz `AlertState` define solo métodos relevantes
- Los estados no implementan métodos que no usan
- Métodos adicionales en estados que los necesitan (ej: `confirmResponse()`)

**D - Dependency Inversion:**
- `Alert` depende de `AlertState` (abstracción)
- No depende de clases concretas (`NewState`, `DistributedState`, etc.)
- Las dependencias apuntan hacia abstracciones

---

## 2.2 Diagrama UML - State

```
┌─────────────────────────────────────┐
│       <<interface>>                 │
│          AlertState                 │
├─────────────────────────────────────┤
│ + getStateName(): string            │
│ + validate(): boolean               │
│ + enrich(): void                    │
│ + distribute(): void                │
│ + resend(): void                    │
│ + confirmResponse(): void           │
│ + resolve(): void                   │
│ + archive(): void                   │
│ + getAvailableActions(): string[]   │
└─────────────────────────────────────┘
           ▲
           │ implements
           │
 ┌─────────┴──────────────┬──────────┬─────────┬──────────┬─────────┐
 │                        │          │         │          │         │
 
 ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
 │ AlertNewState   │ │AlertValidated │ │AlertInDistrib│ │AlertDistributed
 │                 │ │    State      │ │ution State   │ │    State
 ├─────────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
 │ - alert         │ │ - alert      │ │ - alert      │ │ - alert
 │ - timestamp     │ │ - validatedAt│ │ - startedAt  │ │ - distribAt
 ├─────────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
 │ + validate()    │ │ + enrich()   │ │ + distribute()│ │ + resend()
 │ + getActions()  │ │ + validate() │ │ + getActions()│ │ + confirm()
 │   → [validate,  │ │   → [enrich, │ │   → [none]   │ │ + respond()
 │      archive]   │ │      distrib]│ │              │ │ + resolve()
 └─────────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

 ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐
 │AlertResponded  │ │AlertResolved   │ │AlertArchived   │ │AlertEnriched
 │   State        │ │   State        │ │   State        │ │   State
 ├────────────────┤ ├────────────────┤ ├────────────────┤ ├──────────────┤
 │ - alert        │ │ - alert        │ │ - alert        │ │ - alert
 │ - responses    │ │ - resolvedAt   │ │ - archivedAt   │ │ - enrichedAt
 ├────────────────┤ ├────────────────┤ ├────────────────┤ ├──────────────┤
 │ + confirmResp()│ │ + archive()    │ │ + getActions() │ │ + distribute()
 │ + resolve()    │ │ + getActions() │ │   → [none]     │ │ + getActions()
 │ + getActions() │ │   → [archive]  │ │                │ │   → [distrib,
 │   → [resolve,  │ │                │ │                │ │      archive]
 │      archive]  │ │                │ │                │ │
 └────────────────┘ └────────────────┘ └────────────────┘ └──────────────┘
```

### Diagrama de Transiciones de Estado

```
┌───────────┐
│   NEW     │
│           │
│ Actions:  │
│ • validate│
│ • archive │
└─────┬─────┘
      │ validate()
      ↓
┌──────────────┐
│  VALIDATED   │
│              │
│  Actions:    │
│  • enrich()  │
│  • validate()│
│  • archive   │
└──────┬───────┘
       │ enrich()
       ↓
┌──────────────┐
│  ENRICHED    │
│              │
│  Actions:    │
│  • distribute│
│  • archive   │
└──────┬───────┘
       │ distribute()
       ↓
┌──────────────────────┐
│  IN_DISTRIBUTION     │
│                      │
│  Actions: [NONE]     │
│  (en envío, no se    │
│   puede modificar)   │
└──────┬───────────────┘
       │ [Completado]
       ↓
┌──────────────────────┐
│   DISTRIBUTED        │
│                      │
│   Actions:           │
│   • resend()         │
│   • respond()        │
│   • resolve()        │
│   • archive()        │
└────┬────────┬────────┘
     │        │
     │        └────────────────┐
     │                         │
     │ respond()               │ resolve()
     ↓                         ↓
┌──────────────┐     ┌────────────────┐
│  RESPONDED   │     │    RESOLVED    │
│              │     │                │
│  Actions:    │     │  Actions:      │
│  • resolve() │     │  • archive()   │
│  • archive() │     │  • getInfo()   │
└──────┬───────┘     └────────┬───────┘
       │                      │
       └──────────┬───────────┘
                  │ archive()
                  ↓
            ┌──────────────┐
            │  ARCHIVED    │
            │              │
            │  Actions:    │
            │  [NONE]      │
            │  (lectura    │
            │   solamente) │
            └──────────────┘
```

---

## 2.3 Descripción Detallada de Clases

### 1. **AlertState** (Interfaz)

```typescript
interface AlertState {
  // Información del estado
  getStateName(): string;
  
  // Acciones válidas en este estado
  validate(): void;
  enrich(): void;
  distribute(): void;
  resend(): void;
  confirmResponse(userId: string, action: string): void;
  resolve(reason: string): void;
  archive(): void;
  
  // Información para UI
  getAvailableActions(): string[];
  canEdit(): boolean;
  canDelete(): boolean;
  isVisible(): boolean; // ¿Se muestra a usuarios normales?
}
```

**Notas:**
- Cada estado implementa todos estos métodos
- Si una acción no es válida en un estado, lanza excepción o no hace nada
- `getAvailableActions()` retorna qué botones mostrar en UI

---

### 2. **AlertNewState** (Concreto)

```typescript
class AlertNewState implements AlertState {
  constructor(private alert: Alert) {}

  getStateName(): string { return 'NEW'; }

  validate(): void {
    // Transicionar a VALIDATED
    this.alert.setState(new AlertValidatedState(this.alert));
  }

  enrich(): void {
    // No se puede enriquecer una alerta nueva
    throw new Error('Enrich is not allowed in NEW state');
  }

  distribute(): void {
    throw new Error('Distribute is not allowed in NEW state');
  }

  resend(): void {
    throw new Error('Resend is not allowed in NEW state');
  }

  confirmResponse(userId: string, action: string): void {
    throw new Error('No responses are allowed in NEW state');
  }

  resolve(reason: string): void {
    throw new Error('Resolve is not allowed in NEW state');
  }

  archive(): void {
    // Pasar directamente de NEW a ARCHIVED (descarte)
    this.alert.setState(new AlertArchivedState(this.alert));
    console.log(`Alert ${this.alert.id} archivada sin distribuir`);
  }

  getAvailableActions(): string[] {
    return ['validate', 'archive'];
  }

  canEdit(): boolean { return true; }
  canDelete(): boolean { return true; }
  isVisible(): boolean { return false; } // Solo para administradores
}
```

**Responsabilidad:** Alerta acaba de crearse, aún no procesada.

**Acciones Permitidas:**
- ✅ validate() → VALIDATED
- ✅ archive() → ARCHIVED
- ❌ enrich(), distribute(), resend(), etc.

**Visibilidad:**
- No se muestra a usuarios normales
- Solo para administradores

---

### 3. **AlertValidatedState** (Concreto)

```typescript
class AlertValidatedState implements AlertState {
  constructor(private alert: Alert) {}

  getStateName(): string { return 'VALIDATED'; }

  validate(): void {
    // Ya está validada, no hacer nada
    console.log('Alert is already validated');
  }

  enrich(): void {
    // Transicionar a ENRICHED
    this.alert.setState(new AlertEnrichedState(this.alert));
  }

  distribute(): void {
    throw new Error('Must enrich before distribute');
  }

  resend(): void {
    throw new Error('Resend not allowed before distribution');
  }

  confirmResponse(userId: string, action: string): void {
    throw new Error('No responses yet');
  }

  resolve(reason: string): void {
    throw new Error('Resolve not allowed in VALIDATED state');
  }

  archive(): void {
    this.alert.setState(new AlertArchivedState(this.alert));
  }

  getAvailableActions(): string[] {
    return ['enrich', 'archive'];
  }

  canEdit(): boolean { return true; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return false; }
}
```

**Responsabilidad:** Alerta validada, lista para enriquecimiento.

**Acciones Permitidas:**
- ✅ enrich() → ENRICHED
- ✅ archive() → ARCHIVED
- ❌ distribute() (requiere primero enriquecer)

---

### 4. **AlertEnrichedState** (Concreto)

```typescript
class AlertEnrichedState implements AlertState {
  constructor(private alert: Alert) {}

  getStateName(): string { return 'ENRICHED'; }

  validate(): void {
    throw new Error('Already validated');
  }

  enrich(): void {
    // Ya enriquecida
    console.log('Alert is already enriched');
  }

  distribute(): void {
    // Transicionar a IN_DISTRIBUTION
    this.alert.setState(new AlertInDistributionState(this.alert));
    // El servicio inicia el envío aquí
  }

  resend(): void {
    throw new Error('Cannot resend before distribution');
  }

  confirmResponse(userId: string, action: string): void {
    throw new Error('No responses yet');
  }

  resolve(reason: string): void {
    throw new Error('Cannot resolve in ENRICHED state');
  }

  archive(): void {
    this.alert.setState(new AlertArchivedState(this.alert));
  }

  getAvailableActions(): string[] {
    return ['distribute', 'archive'];
  }

  canEdit(): boolean { return true; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return false; }
}
```

---

### 5. **AlertInDistributionState** (Concreto)

```typescript
class AlertInDistributionState implements AlertState {
  constructor(
    private alert: Alert,
    private startTime: Date = new Date()
  ) {}

  getStateName(): string { return 'IN_DISTRIBUTION'; }

  validate(): void {
    throw new Error('Cannot validate during distribution');
  }

  enrich(): void {
    throw new Error('Cannot modify during distribution');
  }

  distribute(): void {
    // Ya está en distribución
    console.log('Distribution is in progress');
  }

  resend(): void {
    throw new Error('Cannot resend during distribution');
  }

  confirmResponse(userId: string, action: string): void {
    throw new Error('Cannot respond during distribution');
  }

  resolve(reason: string): void {
    throw new Error('Cannot resolve during distribution');
  }

  archive(): void {
    throw new Error('Cannot archive during distribution');
  }

  // Método especial para transicionar cuando se completa el envío
  completeDistribution(): void {
    this.alert.setState(new AlertDistributedState(this.alert));
  }

  getAvailableActions(): string[] {
    return []; // Sin acciones, está en envío
  }

  canEdit(): boolean { return false; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return false; } // En envío, no mostrar aún a usuarios
}
```

**Responsabilidad:** Alerta está siendo enviada, estado temporal.

**Características:**
- No permite cambios durante el envío
- Sin acciones de usuario
- Se transiciona automáticamente a DISTRIBUTED cuando completa

---

### 6. **AlertDistributedState** (Concreto)

```typescript
class AlertDistributedState implements AlertState {
  constructor(
    private alert: Alert,
    private distributedAt: Date = new Date(),
    private responses: Map<string, AlertResponse> = new Map()
  ) {}

  getStateName(): string { return 'DISTRIBUTED'; }

  validate(): void {
    throw new Error('Already validated');
  }

  enrich(): void {
    throw new Error('Already enriched');
  }

  distribute(): void {
    // Ya distribuida
    console.log('Alert already distributed');
  }

  resend(): void {
    // Re-enviar a usuarios que no respondieron
    console.log('Resending to users who did not respond...');
    // El servicio maneja el resendeo real
  }

  confirmResponse(userId: string, action: string): void {
    // Registrar respuesta del usuario
    const response: AlertResponse = {
      userId,
      action, // 'ACKNOWLEDGED', 'CONFIRMED', 'DISMISSED'
      timestamp: new Date()
    };
    this.responses.set(userId, response);

    // Si mayoría respondió, considerar resolver
    if (this.shouldAutoResolve()) {
      this.resolve('User responses indicate resolution');
    }
  }

  resolve(reason: string): void {
    // Transicionar a RESOLVED
    this.alert.setState(new AlertResolvedState(this.alert, reason));
  }

  archive(): void {
    // No se archiva directamente desde DISTRIBUTED
    throw new Error('Must resolve before archiving');
  }

  getAvailableActions(): string[] {
    return ['resend', 'confirm_response', 'resolve', 'archive'];
  }

  canEdit(): boolean { return false; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return true; } // Se muestra a usuarios

  private shouldAutoResolve(): boolean {
    // Si el 80% respondió confirmando que está resuelto
    const responses = Array.from(this.responses.values());
    const confirmed = responses.filter(r => r.action === 'CONFIRMED').length;
    return confirmed > (this.alert.affectedUserIds.length * 0.8);
  }
}
```

**Responsabilidad:** Alerta fue distribuida exitosamente, esperando respuestas.

**Acciones Permitidas:**
- ✅ resend() → Reenviar
- ✅ confirmResponse() → Registrar respuesta de usuario
- ✅ resolve() → RESOLVED
- ✅ archive() → ARCHIVED (después de resolver)
- ❌ enrich(), validate()

**Visibilidad:**
- Se muestra a usuarios como alerta activa
- Permite responder (confirmar, descartar)

---

### 7. **AlertRespondedState** (Concreto)

```typescript
class AlertRespondedState implements AlertState {
  constructor(
    private alert: Alert,
    private responses: Map<string, AlertResponse> = new Map()
  ) {}

  getStateName(): string { return 'RESPONDED'; }

  validate(): void { throw new Error('Already validated'); }
  enrich(): void { throw new Error('Already enriched'); }
  distribute(): void { throw new Error('Already distributed'); }
  resend(): void { throw new Error('Cannot resend after responses'); }

  confirmResponse(userId: string, action: string): void {
    // Agregar/actualizar respuesta del usuario
    this.responses.set(userId, {
      userId,
      action,
      timestamp: new Date()
    });
  }

  resolve(reason: string): void {
    // Transicionar a RESOLVED
    this.alert.setState(new AlertResolvedState(this.alert, reason));
  }

  archive(): void {
    throw new Error('Must resolve before archiving');
  }

  getAvailableActions(): string[] {
    return ['confirm_response', 'resolve'];
  }

  canEdit(): boolean { return false; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return true; }
}
```

---

### 8. **AlertResolvedState** (Concreto)

```typescript
class AlertResolvedState implements AlertState {
  constructor(
    private alert: Alert,
    private reason: string,
    private resolvedAt: Date = new Date()
  ) {}

  getStateName(): string { return 'RESOLVED'; }

  validate(): void { throw new Error('Alert is resolved'); }
  enrich(): void { throw new Error('Alert is resolved'); }
  distribute(): void { throw new Error('Alert is resolved'); }
  resend(): void { throw new Error('Alert is resolved'); }
  confirmResponse(userId: string, action: string): void { 
    throw new Error('Alert is resolved'); 
  }

  resolve(reason: string): void {
    // Ya está resuelto
    console.log('Alert is already resolved');
  }

  archive(): void {
    // Transicionar a ARCHIVED
    this.alert.setState(new AlertArchivedState(this.alert));
  }

  getAvailableActions(): string[] {
    return ['archive']; // Solo se puede archivar
  }

  canEdit(): boolean { return false; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return true; } // Mostrar como resuelta en historial
}
```

---

### 9. **AlertArchivedState** (Concreto)

```typescript
class AlertArchivedState implements AlertState {
  constructor(
    private alert: Alert,
    private archivedAt: Date = new Date()
  ) {}

  getStateName(): string { return 'ARCHIVED'; }

  validate(): void { throw new Error('Alert is archived'); }
  enrich(): void { throw new Error('Alert is archived'); }
  distribute(): void { throw new Error('Alert is archived'); }
  resend(): void { throw new Error('Alert is archived'); }
  confirmResponse(userId: string, action: string): void { 
    throw new Error('Alert is archived'); 
  }
  resolve(reason: string): void { throw new Error('Alert is archived'); }
  archive(): void { 
    // Ya está archivada
    console.log('Alert is already archived');
  }

  getAvailableActions(): string[] {
    return []; // Sin acciones, solo lectura
  }

  canEdit(): boolean { return false; }
  canDelete(): boolean { return false; }
  isVisible(): boolean { return false; } // En historial, no en alertas activas
}
```

**Responsabilidad:** Alerta está archivada, ya no se muestra en alertas activas.

**Características:**
- Estado terminal (no se puede transicionar desde aquí)
- Solo lectura
- Disponible en historial

---

## 2.4 Alert - Context

```typescript
@Injectable({ providedIn: 'root' })
class Alert {
  id: string;
  type: string; // 'FLOOD', 'LANDSLIDE', etc.
  riskLevel: string; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  location: LocationInfo;
  message: string;
  affectedUserIds: string[];
  createdAt: Date;
  
  private state: AlertState;

  constructor(
    type: string,
    riskLevel: string,
    location: LocationInfo,
    message: string,
    affectedUserIds: string[]
  ) {
    this.id = generateId();
    this.type = type;
    this.riskLevel = riskLevel;
    this.location = location;
    this.message = message;
    this.affectedUserIds = affectedUserIds;
    this.createdAt = new Date();
    
    // Estado inicial: NEW
    this.state = new AlertNewState(this);
  }

  // Cambiar estado
  setState(newState: AlertState): void {
    console.log(`Alert ${this.id} cambió de ${this.state.getStateName()} a ${newState.getStateName()}`);
    this.state = newState;
  }

  // Obtener estado actual
  getState(): AlertState {
    return this.state;
  }

  // Delegación de métodos al estado actual
  validate(): void { this.state.validate(); }
  enrich(): void { this.state.enrich(); }
  distribute(): void { this.state.distribute(); }
  resend(): void { this.state.resend(); }
  confirmResponse(userId: string, action: string): void {
    this.state.confirmResponse(userId, action);
  }
  resolve(reason: string): void { this.state.resolve(reason); }
  archive(): void { this.state.archive(); }

  // UI helpers
  getAvailableActions(): string[] { return this.state.getAvailableActions(); }
  canEdit(): boolean { return this.state.canEdit(); }
  canDelete(): boolean { return this.state.canDelete(); }
  isVisible(): boolean { return this.state.isVisible(); }
  getStateName(): string { return this.state.getStateName(); }
}
```

---

## 2.5 Servicio Gestor - AlertLifecycleService

```typescript
@Injectable({ providedIn: 'root' })
class AlertLifecycleService {
  constructor(
    private alertService: AlertService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  // Crear alerta en estado NEW
  createAlert(alert: Alert): Alert {
    return this.alertService.save(alert);
  }

  // Validar alerta → NEW → VALIDATED
  validateAlert(alertId: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.validate();
      this.alertService.update(alert);
    } catch (error) {
      console.error(`No se pudo validar alerta: ${error}`);
    }
  }

  // Enriquecer alerta → VALIDATED → ENRICHED
  enrichAlert(alertId: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.enrich();
      this.alertService.update(alert);
    } catch (error) {
      console.error(`No se pudo enriquecer alerta: ${error}`);
    }
  }

  // Distribuir alerta → ENRICHED → IN_DISTRIBUTION → DISTRIBUTED
  distributeAlert(alertId: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.distribute(); // → IN_DISTRIBUTION
      this.alertService.update(alert);

      // Iniciar envío asincrónico
      this.notificationService.sendNotification(alert)
        .then(() => {
          // Completar distribución
          alert.getState()['completeDistribution']?.();
          alert.setState(new AlertDistributedState(alert));
          this.alertService.update(alert);
        })
        .catch((error) => {
          console.error(`Error en distribución: ${error}`);
        });

    } catch (error) {
      console.error(`No se pudo distribuir alerta: ${error}`);
    }
  }

  // Resendear a usuarios que no respondieron
  resendAlert(alertId: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.resend();
      // Resendeo real
      this.notificationService.resendToNonResponders(alert);
      this.auditService.logResend(alertId);
    } catch (error) {
      console.error(`No se pudo resendear: ${error}`);
    }
  }

  // Registrar respuesta de usuario
  recordUserResponse(alertId: string, userId: string, action: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.confirmResponse(userId, action);
      this.alertService.update(alert);
      this.auditService.logResponse(alertId, userId, action);
    } catch (error) {
      console.error(`No se pudo registrar respuesta: ${error}`);
    }
  }

  // Resolver alerta
  resolveAlert(alertId: string, reason: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.resolve(reason);
      this.alertService.update(alert);
      this.auditService.logResolution(alertId, reason);
    } catch (error) {
      console.error(`No se pudo resolver alerta: ${error}`);
    }
  }

  // Archivar alerta
  archiveAlert(alertId: string): void {
    const alert = this.alertService.getById(alertId);
    try {
      alert.archive();
      this.alertService.update(alert);
      this.auditService.logArchive(alertId);
    } catch (error) {
      console.error(`No se pudo archivar: ${error}`);
    }
  }
}
```

---

## 2.6 Integración en Componentes Angular

### Dashboard Component - Mostrando Alertas

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="alerts">
      <div *ngFor="let alert of alerts" class="alert-card">
        
        <!-- Mostrar solo si está visible en su estado actual -->
        <ng-container *ngIf="alert.isVisible()">
          
          <h3>{{ alert.type }} - {{ alert.riskLevel }}</h3>
          <p>{{ alert.message }}</p>
          <p>Estado: {{ alert.getStateName() }}</p>
          
          <!-- Acciones disponibles según el estado -->
          <div class="actions">
            <button 
              *ngIf="alert.getAvailableActions().includes('resend')"
              (click)="resendAlert(alert.id)">
              Resendear
            </button>
            
            <button 
              *ngIf="alert.getAvailableActions().includes('confirm_response')"
              (click)="confirmResponse(alert.id, 'ACKNOWLEDGED')">
              Confirmar
            </button>
            
            <button 
              *ngIf="alert.getAvailableActions().includes('resolve')"
              (click)="resolveAlert(alert.id)">
              Resolver
            </button>
            
            <button 
              *ngIf="alert.getAvailableActions().includes('archive')"
              (click)="archiveAlert(alert.id)">
              Archivar
            </button>
          </div>
          
        </ng-container>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private lifecycleService: AlertLifecycleService) {}

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    // Cargar alertas visibles
    this.alerts = this.alertService.getVisibleAlerts();
  }

  resendAlert(alertId: string) {
    this.lifecycleService.resendAlert(alertId);
  }

  confirmResponse(alertId: string, action: string) {
    this.lifecycleService.recordUserResponse(alertId, this.userId, action);
  }

  resolveAlert(alertId: string) {
    this.lifecycleService.resolveAlert(alertId, 'User confirmed resolution');
  }

  archiveAlert(alertId: string) {
    this.lifecycleService.archiveAlert(alertId);
  }
}
```

---

## 2.7 Ventajas de State en Este Contexto

| Ventaja | Ejemplo |
|---------|---------|
| **Encapsulación** | AlertDistributedState encapsula su comportamiento |
| **Seguridad** | No puedes resendear una alerta NUEVA |
| **Claridad** | El estado dice qué puedes hacer |
| **Testing** | Probar cada estado aisladamente |
| **Extensibilidad** | Nuevo estado = nueva clase |
| **UI-friendly** | `getAvailableActions()` muestra botones correctos |
| **Auditoría** | Registrar transiciones de estado |

---

# RESUMEN Y PRÓXIMOS PASOS

## FASE 2 - COMPLETADA ✅

### Entregables

✅ **Diagrama UML - Chain of Responsibility**
- Interfaz `RiskEventHandler`
- 6 Handlers concretos con responsabilidades claras
- Servicio orquestador `RiskEventProcessingService`
- Integración con servicios existentes

✅ **Diagrama UML - State Pattern**
- Interfaz `AlertState`
- 8 Estados concretos con ciclo de vida completo
- Context `Alert` con delegación al estado
- Servicio gestor `AlertLifecycleService`

✅ **Justificación SOLID**
- Análisis de cada principio SOLID
- Ejemplos concretos del proyecto
- Referencias a clases y métodos específicos

✅ **Plan de Integración**
- Cómo se integra con servicios existentes
- Cambios mínimos requeridos
- Ejemplos en componentes Angular

### Características Principales

**Chain of Responsibility:**
- Procesamiento en cadena sin acoplamiento
- Fail-fast en validaciones
- Extensible a nuevos pasos

**State:**
- Ciclo de vida claro de alertas
- Transiciones validadas
- UI reactiva a estados

---

## PRÓXIMOS PASOS - FASE 3: IMPLEMENTACIÓN

La Fase 3 incluirá:

1. **Estructura de carpetas**
   ```
   src/app/services/behavioral-patterns/
   ├── chain-of-responsibility/
   │   ├── interfaces/
   │   ├── handlers/
   │   ├── services/
   │   └── README.md
   └── state/
       ├── interfaces/
       ├── states/
       ├── services/
       └── README.md
   ```

2. **Implementación TypeScript completa**
   - Clases e interfaces
   - Tipado completo
   - Inyección de dependencias Angular

3. **Integración con servicios**
   - Modificaciones mínimas
   - Ejemplos de uso

4. **Documentación**
   - Guía de uso
   - Diagramas de secuencia
   - Casos de uso

---

**Documento Completado:** FASE 2 - Justificación y Diseño UML  
**Estado:** ✅ Listo para pasar a FASE 3 - Implementación  
**Archivo:** `.github/docs/FASE_2_DISEÑO_UML.md`
