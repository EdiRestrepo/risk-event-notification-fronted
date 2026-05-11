# Alerta Valle - Frontend de Sistema de Alertas Tempranas

## 📋 Descripción

Plataforma de notificación de riesgos para Medellín y el Valle de Aburrá. Permite a los usuarios mantenerse informados sobre inundaciones, deslizamientos y eventos de riesgo en tiempo real.

## 🎯 Características Principales

- ✅ **Login sencillo** con usuario y contraseña
- 📊 **Dashboard interactivo** con mapa de riesgos, alertas y estadísticas
- 🔔 **Múltiples canales de notificación** (SMS, Email, Push, WhatsApp)
- 🏭 **Patrón Factory Method** implementado para creación de canales
- 🎨 **Patrón Decorator** implementado para enriquecimiento de mensajes de alerta
- 🎨 **Diseño responsivo** con Bootstrap 5
- 🌙 **Interfaz moderna** y profesional

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── app.ts                  # Componente raíz
│   ├── app.routes.ts           # Rutas de la aplicación
│   ├── app.config.ts           # Configuración de la app
│   └── app.html                # Template del componente raíz
├── components/
│   ├── login.component.ts      # Componente de login
│   ├── login.component.html    # Template del login
│   ├── login.component.css     # Estilos del login
│   ├── dashboard.component.ts  # Componente del dashboard
│   ├── dashboard.component.html# Template del dashboard
│   └── dashboard.component.css # Estilos del dashboard
├── services/
│   ├── auth.service.ts                      # Servicio de autenticación
│   ├── notification.service.ts              # Servicio de notificaciones (SignalR)
│   ├── user-preferences.service.ts          # Servicio de preferencias
│   ├── factory-method/                      # Patrón Factory Method (GoF)
│   │   ├── notification-channel.interface.ts # Product (interfaz)
│   │   ├── notification-channel-creator.ts   # Creator (clase abstracta)
│   │   ├── channels/                         # ConcreteProducts
│   │   │   ├── sms-channel.ts
│   │   │   ├── email-channel.ts
│   │   │   ├── push-channel.ts
│   │   │   └── whatsapp-channel.ts
│   │   └── creators/                         # ConcreteCreators
│   │       ├── sms-channel-creator.ts
│   │       ├── email-channel-creator.ts
│   │       ├── push-channel-creator.ts
│   │       └── whatsapp-channel-creator.ts
│   └── decorator/                            # Patrón Decorator (GoF) - NUEVO
│       ├── alert-message.interface.ts        # Component (interfaz)
│       ├── base-alert-message.ts             # ConcreteComponent
│       ├── alert-message.decorator.ts        # Decorator (clase abstracta)
│       ├── risk-level-alert.decorator.ts     # ConcreteDecorator
│       ├── location-alert.decorator.ts       # ConcreteDecorator
│       ├── safety-recommendation-alert.decorator.ts # ConcreteDecorator
│       ├── priority-alert.decorator.ts       # ConcreteDecorator
│       ├── timestamp-alert.decorator.ts      # ConcreteDecorator
│       ├── plain-language-alert.decorator.ts # ConcreteDecorator
│       ├── alert-message-builder.service.ts  # Builder Service
│       └── alert-message-builder.service.spec.ts # Unit Tests
└── styles.css                  # Estilos globales
```

## 🏭 Patrón Factory Method

### Descripción

El patrón **Factory Method** se implementa siguiendo la estructura GoF (Gang of Four) completa para crear canales de notificación según las preferencias del usuario. La implementación incluye la jerarquía Creator → ConcreteCreators, donde cada ConcreteCreator sobreescribe el factory method para instanciar su producto concreto.

**Elementos del patrón (GoF):**
- **Product (Interface)**: `NotificationChannel` — define el contrato que todos los canales deben cumplir (`name`, `send()`, `isActive()`)
- **ConcreteProducts**: `SMSChannel`, `EmailChannel`, `PushChannel`, `WhatsAppChannel` — implementaciones concretas del Product
- **Creator (Abstract)**: `NotificationChannelCreator` — declara el factory method abstracto `createChannel()` y una operación `sendNotification()` que lo utiliza
- **ConcreteCreators**: `SMSChannelCreator`, `EmailChannelCreator`, `PushChannelCreator`, `WhatsAppChannelCreator` — cada uno sobreescribe `createChannel()` para retornar su ConcreteProduct

**Cumplimiento SOLID:**
- **SRP**: Cada clase tiene una única responsabilidad (enviar por su canal específico)
- **OCP**: Se pueden agregar nuevos canales creando un nuevo ConcreteCreator y ConcreteProduct sin modificar las clases existentes
- **LSP**: Todos los canales son sustituibles a través de la interfaz `NotificationChannel`
- **ISP**: La interfaz `NotificationChannel` es pequeña y cohesiva (solo `name`, `send()`, `isActive()`)
- **DIP**: Los servicios dependen de la abstracción `NotificationChannelCreator` y `NotificationChannel`, no de las clases concretas

**Canales disponibles:**
- **SMS Channel**: Envía notificaciones via SMS
- **Email Channel**: Envía notificaciones via correo electrónico
- **Push Channel**: Envía notificaciones push en la app
- **WhatsApp Channel**: Envía notificaciones via WhatsApp

### Diagrama UML (GoF Factory Method)

```
  ┌───────────────────────────────────────────┐       ┌─────────────────────────────────┐
  │  <<abstract>>                             │       │  <<interface>>                  │
  │  NotificationChannelCreator               │       │  NotificationChannel            │
  │  (Creator)                                │       │  (Product)                      │
  ├───────────────────────────────────────────┤       ├─────────────────────────────────┤
  │ + createChannel(): NotificationChannel    │·····>│ + name: string                  │
  │   {abstract}                              │       │ + send(message, recipient): void│
  │ + sendNotification(message, recipient)    │       │ + isActive(): boolean           │
  └───────────────────────────────────────────┘       └─────────────────────────────────┘
                    ▲                                               ▲
                    │ extends                                       │ implements
    ┌───────────────┼───────────────────────────┐   ┌───────────────┼───────────────────────────┐
    │               │               │           │   │               │               │           │
┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐
│SMSChannel│ │EmailChannel│ │PushChannel│ │WhatsApp  │ │SMS       │ │Email       │ │Push      │ │WhatsApp  │
│Creator   │ │Creator     │ │Creator    │ │Channel   │ │Channel   │ │Channel     │ │Channel   │ │Channel   │
│          │ │            │ │           │ │Creator   │ │          │ │            │ │          │ │          │
└──────────┘ └────────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘ └──────────┘ └──────────┘
     │               │              │           │          ▲             ▲             ▲            ▲
     │  creates      │  creates     │  creates  │ creates  │             │             │            │
     └───────────────┴──────────────┴───────────┴──────────┘             │             │            │
                                                       └───────────────┘             │            │
                                                                     └───────────────┘            │
                                                                                    └─────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │  UserPreferencesService (Client)                         │
  ├──────────────────────────────────────────────────────────┤
  │ - creators: Map<string, NotificationChannelCreator>      │
  ├──────────────────────────────────────────────────────────┤
  │ + getPreferences()                                       │
  │ + toggleChannel(name)                                    │
  │ + savePreferences()                                      │
  │ + sendNotification(message, recipient)                   │
  └──────────────────────────────────────────────────────────┘
           ▲
           │ (dependencia - flecha punteada)
           │
  ┌────────┴─────────────────────────────────────────┐
  │  NotificationChannelCreator (Creator - Abstract) │
  └────────────────────────────────────────────────────┘
```

**Notación de la relación:**
- **Flecha punteada** (------->) indica una **DEPENDENCIA**
- `UserPreferencesService` (Client) depende de la abstracción `NotificationChannelCreator`
- El Client NO es responsable del ciclo de vida del Creator
- Relación de tipo "usa" (weak coupling)

**Flujo de creación (GoF puro):**
1. `UserPreferencesService` (Client) mantiene un registro de `ConcreteCreators` tipados como `NotificationChannelCreator` (Creator abstracto)
2. Para crear un canal, obtiene el `ConcreteCreator` del registro y llama a `creator.createChannel()`
3. El `ConcreteCreator` ejecuta su factory method y retorna el `ConcreteProduct`
4. El Client recibe una instancia de `NotificationChannel` (Product) sin conocer la clase concreta

### Uso

```typescript
// Usar un ConcreteCreator directamente (GoF puro)
const creator: NotificationChannelCreator = new SMSChannelCreator();
creator.sendNotification('Alerta de lluvia', '+57301234567');

// Crear un canal a través del factory method
const channel: NotificationChannel = creator.createChannel();
channel.send('Alerta de lluvia', '+57301234567');

// Dentro de un servicio, el registro de creators permite seleccionar por tipo
const creators = new Map<string, NotificationChannelCreator>([
  ['sms', new SMSChannelCreator()],
  ['email', new EmailChannelCreator()],
]);
const smsCreator = creators.get('sms')!;
const smsChannel = smsCreator.createChannel();
smsChannel.send(message, recipient);
```

## 🎨 Patrón Decorator - Enriquecimiento de Mensajes de Alerta

### Descripción

El patrón **Decorator** (GOF Structural Pattern) se implementa para enriquecer progresivamente los mensajes de alerta sin modificar las clases base ni los canales de notificación existentes. Esto permite agregar información adicional (nivel de riesgo, ubicación, recomendaciones, prioridad, timestamp, lenguaje claro) de forma flexible y combinable.

**Elementos del patrón (GoF):**
- **Component (Interface)**: `AlertMessage` — define el contrato que todo decorador debe cumplir (`getTitle()`, `getBody()`, `getMetadata()`)
- **ConcreteComponent**: `BaseAlertMessage` — componente base sin decoradores
- **Decorator (Abstract)**: `AlertMessageDecorator` — clase abstracta que envuelve un `AlertMessage` y delega a él
- **ConcreteDecorators**: 
  - `RiskLevelAlertDecorator` — agrega nivel de riesgo al título
  - `LocationAlertDecorator` — agrega zona afectada al cuerpo
  - `SafetyRecommendationAlertDecorator` — agrega recomendaciones de seguridad
  - `PriorityAlertDecorator` — agrega prioridad
  - `TimestampAlertDecorator` — agrega fecha/hora de emisión
  - `PlainLanguageAlertDecorator` — mejora la legibilidad

**Estructura de carpetas:**
```
src/services/decorator/
├── alert-message.interface.ts                        # Component (Interface)
├── base-alert-message.ts                             # ConcreteComponent
├── alert-message.decorator.ts                        # Decorator (Abstract)
├── risk-level-alert.decorator.ts                     # ConcreteDecorator
├── location-alert.decorator.ts                       # ConcreteDecorator
├── safety-recommendation-alert.decorator.ts          # ConcreteDecorator
├── priority-alert.decorator.ts                       # ConcreteDecorator
├── timestamp-alert.decorator.ts                      # ConcreteDecorator
├── plain-language-alert.decorator.ts                 # ConcreteDecorator
├── alert-message-builder.service.ts                  # Builder + Fluent Builder
└── alert-message-builder.service.spec.ts             # Unit Tests
```

**Cumplimiento SOLID:**
- **SRP**: Cada decorador agrega solo un tipo de información específica
- **OCP**: Se pueden crear nuevos decoradores sin modificar los existentes
- **LSP**: Cualquier decorador es sustituible por otro a través de la interfaz `AlertMessage`
- **ISP**: La interfaz `AlertMessage` es pequeña y cohesiva
- **DIP**: El envío depende de la abstracción `AlertMessage`, no de clases concretas

### Ejemplo de uso

```typescript
// Construir una alerta base
let message: AlertMessage = new BaseAlertMessage(
  'Lluvias intensas',
  'Se prevén lluvias intensas durante las próximas horas.'
);

// Aplicar decoradores de forma encadenada
message = new RiskLevelAlertDecorator(message, 'NARANJA');
message = new LocationAlertDecorator(message, ['Medellín', 'Bello']);
message = new SafetyRecommendationAlertDecorator(
  message,
  'Evite transitar cerca de quebradas.'
);
message = new PriorityAlertDecorator(message, 'Alta');
message = new TimestampAlertDecorator(message, new Date());
message = new PlainLanguageAlertDecorator(message);

// Resultado final
console.log(message.getTitle());
// [ALERTA NARANJA] Lluvias intensas

console.log(message.getBody());
// Se prevén lluvias intensas durante las próximas horas.
// Zona afectada: Medellín, Bello.
// Recomendación: Evite transitar cerca de quebradas.
// Prioridad: Alta.
// Emitido: 23 may, 09:25.
// ⚠️ Por favor, siga las recomendaciones para proteger su seguridad.

// Enviar a través de NotificationService
const notification: Notification = {
  title: message.getTitle(),
  message: message.getBody(),
  recipient: 'usuario@example.com',
  channels: ['sms', 'email', 'push']
};

this.notificationService.sendNotification(notification);
```

### Builder Service - Construcción fluida

El `AlertMessageBuilderService` proporciona dos formas de construir alertas:

**1. Factory Methods predefinidos:**
```typescript
// Construcción rápida de alertas comunes
const rainAlert = this.alertMessageBuilder.buildCriticalRainAlert();
const landslideAlert = this.alertMessageBuilder.buildLandslideAlert();
const floodAlert = this.alertMessageBuilder.buildFloodAlert();
```

**2. Fluent Builder (construcción flexible):**
```typescript
const customAlert = this.alertMessageBuilder
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

### Diagrama UML (GoF Decorator)

```mermaid
classDiagram
  class AlertMessage {
    <<interface>>
    +getTitle() string
    +getBody() string
    +getMetadata() Record~string,string~
  }

  class BaseAlertMessage {
    -title string
    -body string
    +getTitle() string
    +getBody() string
    +getMetadata() Record~string,string~
  }

  class AlertMessageDecorator {
    <<abstract>>
    #wrappee AlertMessage
    +getTitle() string
    +getBody() string
    +getMetadata() Record~string,string~
  }

  class RiskLevelAlertDecorator
  class LocationAlertDecorator
  class SafetyRecommendationAlertDecorator
  class PriorityAlertDecorator
  class TimestampAlertDecorator
  class PlainLanguageAlertDecorator
  class AlertMessageBuilderService
  class NotificationService

  AlertMessage <|.. BaseAlertMessage
  AlertMessage <|.. AlertMessageDecorator
  AlertMessageDecorator o-- AlertMessage : envuelve
  AlertMessageDecorator <|-- RiskLevelAlertDecorator
  AlertMessageDecorator <|-- LocationAlertDecorator
  AlertMessageDecorator <|-- SafetyRecommendationAlertDecorator
  AlertMessageDecorator <|-- PriorityAlertDecorator
  AlertMessageDecorator <|-- TimestampAlertDecorator
  AlertMessageDecorator <|-- PlainLanguageAlertDecorator
  AlertMessageBuilderService --> AlertMessage : construye
  NotificationService --> AlertMessage : usa contenido final
```

### Flujo de enriquecimiento progresivo

```
┌─────────────────────────────────────────────────────────────────┐
│ Composición de Decoradores - Enriquecimiento Progresivo         │
├─────────────────────────────────────────────────────────────────┤

1. BaseAlertMessage
   Title: "Lluvias intensas"
   Body: "Se prevén lluvias intensas..."

2. + RiskLevelAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas..."

3. + LocationAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas...
          Zona afectada: Medellín, Bello."

4. + SafetyRecommendationAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas...
          Zona afectada: Medellín, Bello.
          Recomendación: Evite transitar cerca de quebradas."

5. + PriorityAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas...
          Zona afectada: Medellín, Bello.
          Recomendación: Evite transitar cerca de quebradas.
          Prioridad: Alta."

6. + TimestampAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas...
          Zona afectada: Medellín, Bello.
          Recomendación: Evite transitar cerca de quebradas.
          Prioridad: Alta.
          Emitido: 23 may, 09:25."

7. + PlainLanguageAlertDecorator
   Title: "[ALERTA NARANJA] Lluvias intensas"
   Body: "Se prevén lluvias intensas...
          Zona afectada: Medellín, Bello.
          Recomendación: Evite transitar cerca de quebradas.
          Prioridad: Alta.
          Emitido: 23 may, 09:25.
          ⚠️ Por favor, siga las recomendaciones..."

└─────────────────────────────────────────────────────────────────┘
```

### Justificación del patrón

El patrón **Decorator** es adecuado porque:
1. **Flexibilidad**: Los mensajes pueden variar según nivel de riesgo, ubicación, hora, prioridad y recomendaciones sin crear múltiples subclases
2. **Combinabilidad**: Se pueden aplicar decoradores en cualquier orden y combinación
3. **Extensibilidad**: Nuevos decoradores pueden agregarse sin modificar los existentes (OCP)
4. **Mantenibilidad**: Cada decorador tiene una responsabilidad única (SRP)
5. **Integración limpia**: Complementa perfectamente al Factory Method para crear canales sin interferir con su lógica

### Comparación: Factory Method + Decorator

| Aspecto | Factory Method | Decorator |
|--------|---|---|
| **Propósito** | Crear objetos de diferentes tipos | Agregar responsabilidades dinámicamente |
| **Aplica a** | Canales de notificación | Contenido del mensaje |
| **Problemática** | Múltiples formas de crear canales | Múltiples combinaciones de información en alertas |
| **Solución** | Subclasificación (Product/Creator) | Composición (Decorator Chain) |
| **Momento** | En tiempo de creación | En tiempo de compilación y ejecución |

Juntos crean un sistema de alertas **flexible, mantenible y escalable**.



### Requisitos
- Node.js 18+
- npm 10+
- Angular 21+

### Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   npm start
   ```

3. **Compilar para producción**
   ```bash
   npm run build
   ```

## 🔐 Credenciales de Demo

Para probar el login, usa uno de estos usuarios:

| Usuario  | Contraseña | Rol |
|----------|-----------|-----|
| carolina | 1234      | User |
| admin    | admin     | Admin |
| usuario  | 123456    | User |

## 🎨 Tecnologías Utilizadas

- **Angular 21** - Framework frontend
- **Bootstrap 5** - Framework de estilos
- **Bootstrap Icons** - Iconografía
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva

## 📝 Características de Bootstrap

El proyecto utiliza Bootstrap 5 para:
- Componentes responsivos (cards, alerts, badges)
- Sistema de grid para layouts
- Componentes de formulario
- Iconografía (Bootstrap Icons)
- Utilities para espaciado, colores y tipografía

## 🔄 Flujo de Autenticación

1. Usuario ingresa credenciales en el login
2. Se envía solicitud al backend (`https://localhost:44357/api/auth/login`)
3. Si es válido, se guarda el estado de login en localStorage
4. Se redirige al dashboard
5. En el dashboard, se verifica el estado de login al cargar
6. Al cerrar sesión, se limpia el localStorage y se vuelve al login

## 📱 Canales de Notificación

### SMS
- ✅ Activo por defecto
- Envía mensajes de texto a dispositivos móviles

### Email
- ✅ Activo por defecto
- Envía notificaciones al correo electrónico del usuario

### Push Notification (App)
- ✅ Activo por defecto
- Envía notificaciones dentro de la aplicación

### WhatsApp
- ❌ Inactivo por defecto
- Envía notificaciones via WhatsApp

## 🛠️ Configuración de Canales

Para cambiar las preferencias de canales, edita el archivo:
`src/services/user-preferences.service.ts`

```typescript
private userPreferences: UserNotificationPreferences = {
  userId: 'user_001',
  channels: {
    sms: true,        // Habilitar/deshabilitar SMS
    email: true,      // Habilitar/deshabilitar Email
    push: true,       // Habilitar/deshabilitar Push
    whatsapp: false   // Habilitar/deshabilitar WhatsApp
  },
  activeChannels: []
};
```

## 📄 Licencia

Este proyecto es parte del curso de Patrones de Diseño en Edison Academy.

## 👥 Autores

- Desarrollo: Equipo de Desarrollo
- Diseño: Inspirado en AlertasValle.png

---

## 🔍 Observación sobre la implementación del Factory Method

### Observación planteada

> "El patrón Factory Method no está bien implementado porque la creación de canales debería llegar desde el backend y el frontend debe tener la capacidad para crear dichos canales con la información que llega desde el backend."

### Veredicto: FALSO

La observación **confunde dos responsabilidades distintas**: la implementación del patrón creacional y la fuente de datos.

### Justificación

**1. El Factory Method define *cómo* se crean objetos, no *de dónde vienen los datos*.**

El Factory Method es un patrón creacional cuyo propósito es:
- Encapsular la lógica de instanciación de objetos
- Desacoplar al cliente de las clases concretas
- Permitir que el cliente trabaje con abstracciones (la interfaz `NotificationChannel`)

El patrón **no prescribe** de dónde proviene la información para decidir qué objetos crear. Eso es una decisión de arquitectura de datos, no del patrón en sí.

**2. La implementación actual ya soporta datos del backend.**

El código está diseñado para funcionar independientemente del origen de los datos:

```typescript
// Acepta cualquier fuente de datos:
updatePreferences(preferences: Partial<UserNotificationPreferences>): void

// La factory recibe strings — no le importa si vienen del backend, localStorage o hardcode:
createChannels(preferences: string[]): NotificationChannel[]
```

Si mañana se conecta un endpoint que devuelve `{ channels: { sms: true, email: false, push: true, whatsapp: true } }`, solo se necesita hacer un `HttpClient.get()` y pasar esos datos a `updatePreferences()`. La factory funciona exactamente igual — crea las instancias concretas según el array que recibe.

**3. Lo que el compañero describe es otra responsabilidad.**

Lo que plantea es un requerimiento de persistencia y fuente de datos (que las preferencias vengan del backend), no un defecto del patrón. Son dos capas distintas:

| Capa | Responsabilidad | Estado actual |
|------|----------------|---------------|
| **Creación de objetos** (Factory Method) | Instanciar el canal correcto según un tipo | ✅ Correctamente implementado |
| **Fuente de datos** (Servicio HTTP) | Obtener las preferencias del usuario | Simulado localmente (decisión deliberada por ausencia de backend) |

### Conclusión

El patrón Factory Method está correctamente implementado. Lo que el compañero describe es un requerimiento de integración con el backend (que las preferencias se persistan y se lean desde una API), lo cual es un tema de **infraestructura** que no invalida ni afecta la correcta aplicación del patrón creacional. El día que exista el backend, la factory seguirá haciendo exactamente lo mismo: recibir tipos de canal y crear las instancias concretas correspondientes.

---

## 📌 Resumen del Trabajo

**Patrón implementado:** Factory Method (Parameterized) — patrón creacional del catálogo GoF (Gang of Four).

**Funcionalidad:** Cuando un usuario entra al dashboard, puede ver los canales de notificación disponibles (SMS, Email, App y WhatsApp) y activar o desactivar los que prefiera usando los toggles. Al hacer clic en "Gestionar preferencias", el sistema toma los canales que el usuario dejó activos, crea las instancias correspondientes usando la factory y simula el envío de una confirmación por cada canal seleccionado (visible en la consola del navegador).

**Justificación de la implementación del patrón:** En esta aplicación hay varios tipos de canales de notificación y cada uno se comporta diferente (SMS envía un mensaje de texto, Email envía un correo, etc.). En lugar de que el dashboard o el servicio de preferencias tengan que saber cómo crear cada canal con `new SMSChannel()`, `new EmailChannel()`, etc., se delega esa responsabilidad a una factory. El dashboard simplemente le dice "necesito un canal de tipo sms" y la factory se encarga de devolver el objeto correcto. Esto hace que si mañana se necesita agregar un canal nuevo (por ejemplo Telegram), solo se registra en la factory sin tocar el resto del código.

---

**Plataforma de Alertas Tempranas** | Valle de Aburrá | 2026
