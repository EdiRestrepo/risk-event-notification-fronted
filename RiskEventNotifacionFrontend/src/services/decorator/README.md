# Patrón Decorator - Enriquecimiento de Mensajes de Alerta

## 📌 Descripción General

Este módulo implementa el patrón estructural **Decorator** (Gang of Four) para enriquecer progresivamente los mensajes de alerta sin modificar las clases base ni los canales de notificación existentes.

**Propósito:** Agregar información adicional a los mensajes de alerta de forma flexible, combinable y extensible.

## 🎯 Responsabilidades

| Archivo | Tipo | Responsabilidad |
|---------|------|-----------------|
| `alert-message.interface.ts` | Interface | Define el contrato `AlertMessage` |
| `base-alert-message.ts` | Componente Base | Implementa `AlertMessage` sin decoradores |
| `alert-message.decorator.ts` | Decorator Abstracto | Base para todos los decoradores concretos |
| `risk-level-alert.decorator.ts` | Decorator Concreto | Agrega nivel de riesgo al título |
| `location-alert.decorator.ts` | Decorator Concreto | Agrega zona afectada al cuerpo |
| `safety-recommendation-alert.decorator.ts` | Decorator Concreto | Agrega recomendaciones de seguridad |
| `priority-alert.decorator.ts` | Decorator Concreto | Agrega prioridad de la alerta |
| `timestamp-alert.decorator.ts` | Decorator Concreto | Agrega fecha/hora de emisión |
| `plain-language-alert.decorator.ts` | Decorator Concreto | Mejora la legibilidad del mensaje |
| `alert-message-builder.service.ts` | Servicio | Facilita construcción de alertas |
| `alert-message-builder.service.spec.ts` | Tests | Valida el comportamiento del patrón |

## 🏗️ Estructura del Patrón (GOF)

### Component (Interface)
```typescript
export interface AlertMessage {
  getTitle(): string;
  getBody(): string;
  getMetadata(): Record<string, string>;
}
```

### ConcreteComponent (Base)
```typescript
export class BaseAlertMessage implements AlertMessage {
  constructor(private title: string, private body: string) {}
  // ... implementación
}
```

### Decorator (Abstract)
```typescript
export abstract class AlertMessageDecorator implements AlertMessage {
  constructor(protected wrappee: AlertMessage) {}
  // Delega a wrappee y permite que subclases agreguen comportamiento
}
```

### ConcreteDecorators (Concretos)
```typescript
export class RiskLevelAlertDecorator extends AlertMessageDecorator {}
export class LocationAlertDecorator extends AlertMessageDecorator {}
// ... más decoradores
```

## 📚 Ejemplos de Uso

### Ejemplo 1: Construcción Básica
```typescript
let message: AlertMessage = new BaseAlertMessage(
  'Lluvias intensas',
  'Se prevén lluvias intensas durante las próximas horas.'
);

// Agregar decoradores
message = new RiskLevelAlertDecorator(message, 'NARANJA');
message = new LocationAlertDecorator(message, ['Medellín', 'Bello']);
message = new SafetyRecommendationAlertDecorator(message, 'Evite quebradas.');
message = new TimestampAlertDecorator(message, new Date());
```

### Ejemplo 2: Builder Service (Predefinido)
```typescript
// Inyectar el servicio
constructor(private alertBuilder: AlertMessageBuilderService) {}

// Construir una alerta predefinida
const alert = this.alertBuilder.buildCriticalRainAlert();
console.log(alert.getTitle()); // [ALERTA NARANJA] Lluvias intensas
console.log(alert.getBody());  // Mensaje completamente enriquecido
```

### Ejemplo 3: Fluent Builder (Flexible)
```typescript
const alert = this.alertBuilder
  .createBuilder()
  .withTitle('Alerta Personalizada')
  .withBody('Mensaje personalizado')
  .withRiskLevel('AMARILLO')
  .withLocations(['Medellín', 'Envigado'])
  .withRecommendation('Manténgase atento')
  .withPriority('Media')
  .withTimestamp()
  .withPlainLanguage()
  .build();
```

### Ejemplo 4: Integración con NotificationService
```typescript
const decoratedMessage = this.alertBuilder.buildCriticalRainAlert();

const notification: Notification = {
  title: decoratedMessage.getTitle(),
  message: decoratedMessage.getBody(),
  recipient: 'usuario@example.com',
  channels: ['sms', 'email', 'push', 'whatsapp']
};

this.notificationService.sendNotification(notification);
```

## 🧪 Testing

El módulo incluye pruebas unitarias completas en `alert-message-builder.service.spec.ts`:

```bash
npm test
```

**Casos de prueba:**
- ✅ Creación de mensaje base sin decoradores
- ✅ Cada decorador agrega su información correctamente
- ✅ Composición de múltiples decoradores en cadena
- ✅ Mantención del contrato `AlertMessage` en todos los decoradores
- ✅ Construcción fluida con Builder
- ✅ Validación de errores en Builder
- ✅ Métodos factory predefinidos

## 🔄 Flujo de Ejecución

```
┌─────────────────────────────────────────────┐
│ 1. Dashboard.component.ts                   │
│    sendCriticalRainAlert()                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 2. AlertMessageBuilderService               │
│    buildCriticalRainAlert()                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 3. BaseAlertMessage                         │
│    new BaseAlertMessage(title, body)        │
└──────────────┬──────────────────────────────┘
               │
               ├─▶ RiskLevelAlertDecorator
               ├─▶ LocationAlertDecorator
               ├─▶ SafetyRecommendationAlertDecorator
               ├─▶ PriorityAlertDecorator
               ├─▶ TimestampAlertDecorator
               └─▶ PlainLanguageAlertDecorator
               │
               ▼
┌─────────────────────────────────────────────┐
│ 4. AlertMessage (totalmente enriquecida)    │
│    getTitle() → "[ALERTA NARANJA] ..."      │
│    getBody() → "... con info completa"      │
│    getMetadata() → { ... metadata ... }     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 5. NotificationService                      │
│    sendNotification(notification)           │
│    (utiliza Factory Method para canales)    │
└──────────────┬──────────────────────────────┘
               │
               ├─▶ SMSChannel.send()
               ├─▶ EmailChannel.send()
               ├─▶ PushChannel.send()
               └─▶ WhatsAppChannel.send()
```

## 💡 Principios SOLID Aplicados

### Single Responsibility Principle (SRP)
Cada decorador tiene una única responsabilidad:
- `RiskLevelAlertDecorator` → Solo agrega nivel de riesgo
- `LocationAlertDecorator` → Solo agrega ubicación
- `SafetyRecommendationAlertDecorator` → Solo agrega recomendaciones
- etc.

### Open/Closed Principle (OCP)
- ✅ Abierto para extensión: Nuevos decoradores se crean sin modificar los existentes
- ✅ Cerrado para modificación: No se requieren cambios en clases existentes

### Liskov Substitution Principle (LSP)
- Todos los decoradores son intercambiables a través de la interfaz `AlertMessage`
- El cliente no necesita conocer el tipo específico del decorador

### Interface Segregation Principle (ISP)
- La interfaz `AlertMessage` es pequeña y cohesiva
- Define solo los métodos esenciales: `getTitle()`, `getBody()`, `getMetadata()`

### Dependency Inversion Principle (DIP)
- El Dashboard depende de la abstracción `AlertMessage`, no de clases concretas
- El builder depende de interfaces, no de implementaciones

## 🚀 Extensibilidad

Para agregar un nuevo decorador:

```typescript
// 1. Crear el archivo nuevo
// src/services/decorator/my-custom-alert.decorator.ts

import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

export class MyCustomAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private customData: string) {
    super(wrappee);
  }

  override getBody(): string {
    return `${this.wrappee.getBody()}\nMi dato personalizado: ${this.customData}`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      myCustomKey: this.customData
    };
  }
}

// 2. Usarlo en el Builder
message = new MyCustomAlertDecorator(message, 'valor');
```

## 📊 Comparación: Sin Patrón vs Con Patrón

### ❌ Sin Patrón (Problema)
```typescript
// Necesitaría múltiples subclases
class RainAlertWithRiskAndLocation extends BaseAlert { }
class RainAlertWithRiskLocationAndPriority extends BaseAlert { }
class RainAlertWithAll extends BaseAlert { }
// Explosión combinatoria de clases
```

### ✅ Con Patrón (Solución)
```typescript
// Composición flexible
message = new BaseAlertMessage(...);
message = new RiskLevelAlertDecorator(message, ...);
message = new LocationAlertDecorator(message, ...);
message = new PriorityAlertDecorator(message, ...);
// Fácilmente combinable
```

## 📝 Integración con Factory Method

El patrón **Decorator** complementa al **Factory Method** sin interferir:

| Aspecto | Factory Method | Decorator |
|--------|---|---|
| **Qué crea** | Canales de notificación | Contenido del mensaje |
| **Cuándo se aplica** | En tiempo de creación del canal | Antes de enviar el mensaje |
| **Responsabilidad** | Creación de objetos | Enriquecimiento de datos |
| **Modificación** | Canales no se modifican | Contenido se enriquece |

**Flujo integrado:**
```
Factory Method: Crear → Canales (SMS, Email, Push, WhatsApp)
       ↓
Decorator: Enriquecer → Mensaje ([ALERTA NARANJA] Lluvias intensas + ubicación + prioridad + ...)
       ↓
NotificationService: Enviar → A través de los canales activos
```

## 🔍 Validación y Debugging

Para ver el enriquecimiento progresivo en acción:

```typescript
// En el browser console, al ejecutar:
const alert = alertBuilder.buildCriticalRainAlert();

console.group('Mensaje Enriquecido');
console.log('Título:', alert.getTitle());
console.log('Cuerpo:', alert.getBody());
console.log('Metadata:', alert.getMetadata());
console.groupEnd();
```

## 📚 Referencias

- **Gang of Four - Decorator Pattern**: https://refactoring.guru/design-patterns/decorator
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **Composite Pattern vs Decorator**: https://refactoring.guru/design-patterns/composite-vs-decorator

## ✅ Checklist de Implementación

- [x] Interface `AlertMessage` definida
- [x] Clase base `BaseAlertMessage` implementada
- [x] Decorator abstracto `AlertMessageDecorator` implementado
- [x] 6 decoradores concretos implementados
- [x] Builder service con métodos factory
- [x] Fluent builder para construcción flexible
- [x] Integración con Dashboard component
- [x] Pruebas unitarias completas
- [x] Documentación en FRONTEND_GUIDE.md
- [x] Ejemplos de uso en componentes
