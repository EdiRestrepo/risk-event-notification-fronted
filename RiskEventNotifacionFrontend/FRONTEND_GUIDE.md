# Alerta Valle - Frontend de Sistema de Alertas Tempranas

## 📋 Descripción

Plataforma de notificación de riesgos para Medellín y el Valle de Aburrá. Permite a los usuarios mantenerse informados sobre inundaciones, deslizamientos y eventos de riesgo en tiempo real.

## 🎯 Características Principales

- ✅ **Login sencillo** con usuario y contraseña
- 📊 **Dashboard interactivo** con mapa de riesgos, alertas y estadísticas
- 🔔 **Múltiples canales de notificación** (SMS, Email, Push, WhatsApp)
- 🏭 **Patrón Factory Method** implementado para preferencias de usuario
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
│   ├── notification-channel.interface.ts    # Interfaz de canales
│   ├── notification-channels.ts             # Implementaciones de canales
│   ├── notification-channel.factory.ts      # Factory Method
│   └── user-preferences.service.ts          # Servicio de preferencias
└── styles.css                  # Estilos globales
```

## 🏭 Patrón Factory Method

### Descripción

El patrón **Factory Method (Parameterized)** se implementa para crear canales de notificación según las preferencias del usuario. Esta variante está documentada en el libro GoF (Gang of Four) y es la más adecuada para contextos de inyección de dependencias como Angular.

**Elementos del patrón:**
- **Product (Interface)**: `NotificationChannel` — define el contrato que todos los canales deben cumplir
- **ConcreteProducts**: `SMSChannel`, `EmailChannel`, `PushChannel`, `WhatsAppChannel` — implementaciones concretas
- **Factory**: `NotificationChannelFactory` — encapsula la lógica de creación, el cliente nunca instancia directamente las clases concretas

**Cumplimiento SOLID:**
- **SRP**: Cada clase tiene una única responsabilidad (enviar por su canal específico)
- **OCP**: La factory usa un registro (`Map`) en lugar de `switch`, permitiendo agregar nuevos canales con `registerChannel()` sin modificar la clase
- **LSP**: Todos los canales son sustituibles a través de la interfaz `NotificationChannel`
- **ISP**: La interfaz `NotificationChannel` es pequeña y cohesiva (solo `name`, `send()`, `isActive()`)
- **DIP**: `UserPreferencesService` depende de la abstracción `NotificationChannel`, no de las clases concretas

**Canales disponibles:**
- **SMS Channel**: Envía notificaciones via SMS
- **Email Channel**: Envía notificaciones via correo electrónico
- **Push Channel**: Envía notificaciones push en la app
- **WhatsApp Channel**: Envía notificaciones via WhatsApp

### Diagrama UML

```
┌─────────────────────────────────┐
│  <<interface>>                  │
│  NotificationChannel            │
├─────────────────────────────────┤
│ + name: string                  │
│ + send(message, recipient): void│
│ + isActive(): boolean           │
└─────────────────────────────────┘
              ▲
              │ implements
    ┌─────────┼──────────────────────────────────┐
    │         │                  │                │
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐
│SMSChannel │ │EmailChannel│ │PushChannel│ │WhatsAppChannel│
└───────────┘ └───────────┘ └───────────┘ └─────────────┘
    ▲              ▲              ▲              ▲
    │              │              │              │
    └──────────────┴──────────────┴──────────────┘
                   created by
    ┌──────────────────────────────────────────┐
    │  NotificationChannelFactory              │
    ├──────────────────────────────────────────┤
    │ - channelRegistry: Map<string, Function> │
    ├──────────────────────────────────────────┤
    │ + createChannel(type): NotificationChannel│
    │ + createChannels(prefs): NotificationChannel[]│
    │ + registerChannel(type, creator): void   │
    │ + getAvailableChannels(): string[]       │
    └──────────────────────────────────────────┘
              ▲
              │ uses (DI)
    ┌──────────────────────────────────────────┐
    │  UserPreferencesService                  │
    ├──────────────────────────────────────────┤
    │ + getPreferences()                       │
    │ + toggleChannel(name)                    │
    │ + savePreferences()                      │
    │ + sendNotification(message, recipient)   │
    └──────────────────────────────────────────┘
```

### Uso

```typescript
// Inyectar la factory
constructor(private factory: NotificationChannelFactory) {}

// Crear un canal específico
const smsChannel = this.factory.createChannel('sms');
smsChannel.send('Alerta de lluvia', '+57301234567');

// Crear múltiples canales según preferencias del usuario
const channels = this.factory.createChannels(['sms', 'email', 'push']);
channels.forEach(ch => ch.send(message, recipient));

// Registrar un nuevo canal sin modificar la factory (OCP)
this.factory.registerChannel('telegram', () => new TelegramChannel());
```

## 🚀 Instalación y Ejecución

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

**Plataforma de Alertas Tempranas** | Valle de Aburrá | 2026
