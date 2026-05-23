# FASE 1: Análisis e Identificación de Patrones de Comportamiento

**Fecha:** Mayo 22, 2026  
**Proyecto:** Risk Event Notification Frontend  
**Contexto:** Sistema de notificaciones de eventos de riesgo para Medellín y Valle de Aburrá

---

## Análisis Arquitectónico del Proyecto

### Estructura Actual

El proyecto implementa una arquitectura modular basada en servicios Angular con patrones creacionales y estructurales ya implementados:

**Patrones Implementados:**
- ✅ **Factory Method** (Creacional): Creación de canales de notificación (SMS, Email, Push, WhatsApp)
- ✅ **Decorator** (Estructural): Enriquecimiento de mensajes de alerta con información adicional (ubicación, prioridad, recomendaciones, timestamp)
- ✅ **Facade** (Estructural): Centralización de la lógica de alertas (AlertCenterFacade)

### Módulos Principales y Flujos

1. **Módulo de Autenticación** (`auth.service.ts`):
   - Login y gestión de sesiones

2. **Módulo de Preferencias de Usuario** (`user-preferences.service.ts`):
   - Obtención y persistencia de preferencias de canales
   - Gestión de qué canales usar por usuario

3. **Módulo de Notificaciones** (`notification.service.ts`):
   - Integración con SignalR para eventos en tiempo real
   - Coordinación entre múltiples servicios

4. **Módulo de Generación de Alertas** (decorator/):
   - Construcción dinámica de mensajes de alerta
   - Decoradores especializados por tipo de información

5. **Módulo de Envío** (factory-method/):
   - Creación y envío a través de diferentes canales

### Problema Actual: Comunicación entre Módulos

Los módulos requieren **mecanismos claros de comunicación** para:
- Procesar eventos de riesgo detectados por SIATA
- Validar y enriquecer datos
- Tomar decisiones sobre qué alertas generar
- Gestionar diferentes estados de las alertas
- Manejar procesos complejos que requieren múltiples pasos

---

## PROBLEMA 1: Procesamiento y Validación de Eventos en Cadena

### Descripción Detallada

**Situación Actual:**
El sistema recibe eventos de SIATA (inundaciones, deslizamientos) que requieren ser **procesados en una cadena de responsabilidades**:

1. **Recepción del evento** → Evento bruto del API de SIATA
2. **Validación** → ¿Los datos son válidos? ¿Está completo?
3. **Enriquecimiento** → Agregar información geoespacial, contexto adicional
4. **Análisis de Riesgo** → Determinar nivel de riesgo (bajo, medio, alto, crítico)
5. **Generación de Alerta** → Crear alerta basada en análisis
6. **Determinación de Canales** → ¿A quiénes notificar y por qué canales?
7. **Envío** → Ejecutar envío a través de canales seleccionados

**Problema Específico:**

Sin un patrón claro de cadena, el código resultaría en:
- ❌ **Acoplamiento alto**: Cada paso conocería al siguiente, haciendo cambios frágiles
- ❌ **Responsabilidades mezcladas**: Un servicio haría validación + enriquecimiento + análisis
- ❌ **Dificultad para agregar pasos**: Agregar un nuevo paso de validación requeriría modificar múltiples servicios
- ❌ **Falta de flexibilidad**: No se podría saltear pasos o cambiar el orden dinámicamente
- ❌ **Testing complejo**: Difícil probar cada paso en aislamiento

**Impacto en el Reto:**
En un contexto de **emergencias en tiempo real**, procesamiento lento o con bugs es crítico. Los usuarios no pueden esperar, y los eventos deben procesarse de forma confiable y rápida.

### Patrón Recomendado: **Chain of Responsibility**

#### ¿Por qué este patrón?

**Chain of Responsibility** es ideal porque:

1. ✅ **Desacoplamiento**: Cada handler solo conoce al siguiente en la cadena, no a todos
2. ✅ **Responsabilidad única**: Cada handler hace UNA cosa (valida, enriquece, analiza)
3. ✅ **Flexibilidad**: Se pueden agregar/remover handlers sin cambiar código existente
4. ✅ **Orden dinámico**: La orden de procesamiento puede cambiar en tiempo de ejecución
5. ✅ **Bypass**: Un handler puede decidir no pasar la solicitud si detecta un problema

#### Estructura para el Proyecto

```
Componentes del patrón:
  ├── Interfaz: EventHandler
  │   └── métodos: handle(evento, siguiente): void
  │
  ├── Handlers Concretos (en orden):
  │   ├── RiskEventValidationHandler
  │   ├── RiskEventEnrichmentHandler
  │   ├── RiskLevelAnalysisHandler
  │   ├── AlertGenerationHandler
  │   ├── NotificationChannelSelector
  │   └── NotificationDispatcher
  │
  └── Servicio Orquestador:
      └── RiskEventProcessingPipeline
          └── configura y ejecuta la cadena
```

#### Ejemplo de Flujo

```typescript
// Pseudocódigo - Cómo funcionaría
const evento = receptor.obtenerEventoDeSIATA(); // Evento bruto

const pipeline = new RiskEventProcessingPipeline();
pipeline
  .addHandler(new RiskEventValidationHandler())
  .addHandler(new RiskEventEnrichmentHandler())
  .addHandler(new RiskLevelAnalysisHandler())
  .addHandler(new AlertGenerationHandler())
  .addHandler(new NotificationChannelSelector())
  .addHandler(new NotificationDispatcher());

// Procesa: validación → enriquecimiento → análisis → alerta → selección → envío
const resultado = pipeline.process(evento);
```

#### Cómo Mejora la Comunicación

| Aspecto | Antes (Sin patrón) | Después (Chain of Responsibility) |
|--------|-------|-----------|
| **Acoplamiento** | RiskService conoce todos los pasos | RiskService solo conoce al primer handler |
| **Cambios** | Modificar un paso afecta el servicio | Cambiar/agregar un handler no afecta otros |
| **Testing** | Difícil probar pasos en aislamiento | Cada handler se prueba independientemente |
| **Orden de proceso** | Fijo en el código | Configurable en runtime |
| **Mantenibilidad** | Frágil, cambios en cascada | Robusto, cambios locales |

#### Cumplimiento de Principios SOLID

✅ **S (Single Responsibility)**: Cada handler tiene una responsabilidad clara (validar, enriquecer, analizar)

✅ **O (Open/Closed)**: Abierto para extensión (nuevos handlers), cerrado para modificación (los existentes no cambian)

✅ **L (Liskov Substitution)**: Todos los handlers son intercambiables, implementan la misma interfaz

✅ **I (Interface Segregation)**: Interfaz `EventHandler` es pequeña y cohesiva

✅ **D (Dependency Inversion)**: El pipeline depende de la abstracción `EventHandler`, no de clases concretas

---

## PROBLEMA 2: Gestión de Estados y Cambios de Comportamiento de Alertas

### Descripción Detallada

**Situación Actual:**
Una alerta en el sistema tiene un **ciclo de vida con múltiples estados** donde el comportamiento cambia según el estado actual:

**Estados de una Alerta:**
1. **NUEVA** → Acaba de ser creada, no se ha procesado
2. **VALIDADA** → Ha pasado validaciones
3. **ENRIQUECIDA** → Se ha agregado información adicional
4. **EN DISTRIBUCIÓN** → Se está enviando a usuarios
5. **DISTRIBUIDA** → Se envió exitosamente
6. **RESPONDIDA** → Un usuario tomó acción (confirmó, descartó)
7. **RESUELTA** → El evento de riesgo ya pasó
8. **ARCHIVADA** → Obsoleta, no se muestra en dashboard

**Cambios de Comportamiento según Estado:**

| Estado | Comportamiento |
|--------|---------------|
| **NUEVA** | No se muestra a usuarios, solo a admin. Puede editarse |
| **VALIDADA** | Sistema espera enriquecimiento, puede pausarse |
| **EN DISTRIBUCIÓN** | No puede editarse, se está enviando ahora |
| **DISTRIBUIDA** | Se muestra a usuarios, espera respuesta, puede resendear |
| **RESPONDIDA** | Se registran respuestas, genera estadísticas |
| **RESUELTA** | Se marca como resuelta, deja de ser urgente |
| **ARCHIVADA** | No se muestra, pero está disponible en historial |

**Problema Específico:**

Sin un patrón claro de estados, el código resultaría en:
- ❌ **Condicionales anidados**: Múltiples `if-else` checking estados
- ❌ **Acciones inconsistentes**: Diferentes servicios chequean estados de forma diferente
- ❌ **Difícil agregar estados**: Agregar un nuevo estado requiere cambiar múltiples métodos
- ❌ **Transiciones inválidas**: Sin validación, podría pasar a un estado inválido
- ❌ **Lógica esparcida**: La lógica de cada estado está esparcida en múltiples métodos
- ❌ **Testing complejo**: Difícil probar todas las transiciones

**Ejemplo del Problema:**

```typescript
// Sin patrón - Lógica complicada
class Alert {
  state: string;
  
  process() {
    if (this.state === 'NEW') {
      // validar
      this.state = 'VALIDATED';
    } else if (this.state === 'VALIDATED') {
      // enriquecer
      this.state = 'ENRICHED';
    } else if (this.state === 'ENRICHED') {
      // distribuir
      // ...
    }
    // ... más estados
  }
  
  resend() {
    if (this.state === 'DISTRIBUTED') {
      // resendear
    } else if (this.state === 'RESOLVED') {
      // no se puede resendear
      throw new Error(...);
    } else {
      // ¿otros estados?
    }
  }
}
```

**Impacto en el Reto:**
En un contexto de emergencias, el usuario necesita **saber en qué estado está la alerta** y qué acciones puede realizar. Si el sistema no tiene una gestión clara de estados, la experiencia es confusa y potencialmente peligrosa.

### Patrón Recomendado: **State**

#### ¿Por qué este patrón?

**State** es ideal porque:

1. ✅ **Encapsulación**: Cada estado encapsula su comportamiento
2. ✅ **Transiciones claras**: Solo estados válidos pueden transicionar entre sí
3. ✅ **Lógica localizada**: Toda la lógica de un estado está en una clase, no esparcida
4. ✅ **Fácil de extender**: Agregar un nuevo estado = crear una nueva clase
5. ✅ **Seguridad**: Impide transiciones inválidas
6. ✅ **Testeable**: Cada estado se prueba independientemente

#### Estructura para el Proyecto

```
Componentes del patrón:
  ├── Interfaz: AlertState
  │   └── métodos: validate(), enrich(), distribute(), etc.
  │
  ├── Estados Concretos:
  │   ├── AlertNewState
  │   ├── AlertValidatedState
  │   ├── AlertEnrichedState
  │   ├── AlertInDistributionState
  │   ├── AlertDistributedState
  │   ├── AlertRespondedState
  │   ├── AlertResolvedState
  │   └── AlertArchivedState
  │
  ├── Context:
  │   └── Alert (mantiene el estado actual)
  │
  └── Transiciones:
      └── Definidas por cada estado
          (solo estados válidos se pueden alcanzar)
```

#### Ejemplo de Flujo

```typescript
// Pseudocódigo - Cómo funcionaría
const alert = new Alert(); // Estado: NEW

alert.validate();    // Transiciona a VALIDATED
alert.enrich();      // Transiciona a ENRICHED
alert.distribute();  // Transiciona a IN_DISTRIBUTION → DISTRIBUTED
alert.respond();     // Transiciona a RESPONDED

alert.archive();     // Transiciona a ARCHIVED

// Acciones que respetan el estado:
alert.resend();      // OK si estado es DISTRIBUTED
alert.resend();      // ERROR si estado es ARCHIVED (inválido)
```

#### Cómo Mejora la Comunicación

| Aspecto | Antes (Sin patrón) | Después (State) |
|--------|-------|-----------|
| **Lógica de comportamiento** | Esparcida en múltiples métodos | Localizada en cada estado |
| **Transiciones** | No validadas, acciones incorrectas posibles | Validadas, solo transiciones válidas |
| **Cambios** | Afectan múltiples métodos | Aislados a una clase de estado |
| **Claridad** | ¿Qué puedo hacer en este estado? Confuso | Claro, el estado define acciones |
| **Testing** | Complejo, muchas combinaciones | Simple, cada estado se prueba |

#### Cumplimiento de Principios SOLID

✅ **S (Single Responsibility)**: Cada estado tiene una responsabilidad (su comportamiento)

✅ **O (Open/Closed)**: Abierto para extensión (nuevos estados), cerrado para modificación (estados existentes no cambian)

✅ **L (Liskov Substitution)**: Todos los estados son intercambiables, implementan la misma interfaz

✅ **I (Interface Segregation)**: Interfaz `AlertState` define solo métodos relevantes

✅ **D (Dependency Inversion)**: `Alert` depende de la abstracción `AlertState`, no de clases concretas

---

## Análisis Comparativo: Aplicabilidad en el Contexto del Reto

### Chain of Responsibility vs State

#### Tabla Comparativa

| Criterio | Chain of Responsibility | State |
|----------|-------------------------|-------|
| **Problema que resuelve** | Procesamiento secuencial de datos | Cambio de comportamiento según estado |
| **Momento de uso** | ENTRADA: procesar evento bruto | DURANTE: alerta cambia de comportamiento |
| **Flujo** | Lineal (evento pasa por cadena) | Cíclico (transiciones entre estados) |
| **Complejidad** | Media (múltiples pasos) | Baja (pocos pasos por estado) |
| **Cambios frecuentes** | Orden de pasos puede cambiar | Estados relativamente fijos |
| **Testing** | Testear cada handler | Testear transiciones entre estados |
| **Escalabilidad** | Excelente (agregar handlers) | Excelente (agregar estados) |

#### Aplicabilidad en Contexto de Riesgo

**Chain of Responsibility es MÁS APLICABLE porque:**

1. ✅ **Crítico en el flujo**: El procesamiento de eventos es el CORAZÓN del sistema
   - Si fallamos en validación, enriquecimiento o análisis, las alertas serán incorrectas
   - Afecta directamente la seguridad de los usuarios

2. ✅ **Extensibilidad esperada**: Futuros requisitos pueden agregar pasos
   - Ejemplo: "Agregar filtro de eventos duplicados"
   - Ejemplo: "Agregar autenticación de fuentes de SIATA"
   - Con Chain of Responsibility, esto es trivial (agregar un handler)

3. ✅ **Complejidad del procesamiento**: El procesamiento requiere múltiples pasos interdependientes
   - El análisis de riesgo depende del enriquecimiento
   - La generación de alerta depende del análisis
   - La cadena garantiza el orden

4. ✅ **Urgencia/Performance**: En emergencias, queremos procesamiento eficiente
   - Un handler puede "rechazar" un evento inválido temprano (fail-fast)
   - Evita procesamiento innecesario

**State es COMPLEMENTARIO porque:**
- Se aplica DESPUÉS de que la alerta se ha creado
- Gestiona el ciclo de vida de la alerta, no su creación
- Ambos patrones se pueden usar juntos (no son mutuamente excluyentes)

#### Relación entre Ambos Patrones

```
ENTRADA (Evento bruto del SIATA)
        ↓
[CHAIN OF RESPONSIBILITY] ← Procesa
        ├── Validación
        ├── Enriquecimiento
        ├── Análisis de Riesgo
        └── Genera Alerta
        ↓
ALERTA CREADA (estado = NEW)
        ↓
[STATE PATTERN] ← Gestiona ciclo de vida
        ├── VALIDATED → ENRICHED → DISTRIBUTED → etc.
        └── En cada estado, comportamientos diferentes
        ↓
ALERTA ARCHIVADA
```

---

## Conclusiones

### Recomendación Final

**Se recomienda implementar ambos patrones, siendo Chain of Responsibility el prioritario:**

1. **Chain of Responsibility (PRIORIDAD: ALTA - 70%)**
   - Resuelve el procesamiento de eventos de riesgo
   - Crítico para la exactitud de las alertas
   - Directamente impacta la seguridad del usuario
   - Altamente extensible para futuros requisitos

2. **State Pattern (PRIORIDAD: MEDIA-ALTA - 60%)**
   - Resuelve la gestión del ciclo de vida de alertas
   - Mejora la claridad del sistema
   - Facilita la UI/UX (mostrar acciones disponibles por estado)
   - Complementa a Chain of Responsibility

### Justificación de Priorización

En un contexto de **EMERGENCIAS EN TIEMPO REAL**:
- El procesamiento correcto de eventos es CRÍTICO (Chain of Responsibility)
- La gestión clara de estados es IMPORTANTE (State)
- Ambos mejoran la comunicación entre componentes significativamente

### Próximos Pasos

- **FASE 2**: Crear diagramas UML detallados para ambos patrones
- **FASE 3**: Implementar ambos patrones en Angular respetando SOLID

---

**Documento Completado:** FASE 1 - Análisis e Identificación  
**Estado:** ✅ Listo para pasar a FASE 2 - Justificación y Diseño
