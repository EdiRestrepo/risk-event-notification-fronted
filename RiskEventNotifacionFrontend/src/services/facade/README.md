# AlertCenterFacadeService - Patrón FACADE

## Propósito

`AlertCenterFacadeService` es el **punto único de acceso** para que `DashboardComponent` interactúe con el sistema de alertas y notificaciones.

La fachada simplifica la coordinación entre múltiples servicios sin modificar ni duplicar la lógica existente de los patrones Factory Method y Decorator.

## Ventajas de la Fachada

### 1. **Desacoplamiento**
- DashboardComponent depende SOLO del Facade
- NO conoce directamente: NotificationService, UserPreferencesService, AlertMessageBuilderService
- Cambios internos no afectan el componente

### 2. **Simplicidad**
- Interfaz unificada y clara
- Métodos con responsabilidades específicas
- Observable de alertas expuesto directamente

### 3. **Integración de Patrones**
- Factory Method: Disponible vía NotificationService (sin cambios)
- Decorator: Disponible vía AlertMessageBuilderService (sin cambios)
- Facade: Orquesta ambos patrones

### 4. **Mantenibilidad**
- Lógica de coordinación centralizada
- Fácil de testear
- Fácil de extender

## API Pública

### Propiedades

```typescript
get alerts$(): Observable<RealTimeAlert[]>
```
Observable de alertas en tiempo real desde NotificationService.

### Métodos de Inicialización

```typescript
initializeAlertCenter(userId: string): void
```
- Carga preferencias del usuario
- Inicia conexión SignalR
- Configura canales activos

### Métodos de Alertas

```typescript
sendCriticalRainAlert(): void
sendLandslideAlert(): void
sendFloodAlert(): void
removeAlert(alertId: string): void
```
Envían alertas enriquecidas usando Decorator y Factory Method internamente.

### Métodos de Preferencias

```typescript
getActiveChannels(): string[]
toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void
savePreferences(): Observable<SavePreferencesResponse>
```
Gestionan las preferencias del usuario.

### Métodos de Sesión

```typescript
logout(): void
```
Cierra la sesión y limpia datos.

## Estructura Interna

```
AlertCenterFacadeService
│
├─ NotificationService (Factory Method)
│  └─ sendNotification() → crea y envía por canales
│
├─ AlertMessageBuilderService (Decorator)
│  └─ buildCriticalRainAlert() → enriquece mensaje
│
├─ UserPreferencesService
│  └─ loadPreferences() → obtiene canales activos
│
└─ Router
   └─ navigate() → maneja redirecciones
```

## Flujo de Envío de Alerta

```
sendCriticalRainAlert()
│
├─ 1. getActiveChannels() → ['sms', 'email']
├─ 2. alertMessageBuilder.buildCriticalRainAlert()
│    └─ Aplica decoradores:
│       ├─ RiskLevelAlertDecorator
│       ├─ LocationAlertDecorator
│       ├─ SafetyRecommendationAlertDecorator
│       ├─ PriorityAlertDecorator
│       ├─ TimestampAlertDecorator
│       └─ PlainLanguageAlertDecorator
│
├─ 3. Crea Notification { title, message, recipient, channels }
│
└─ 4. notificationService.sendNotification()
     └─ Factory Method crea y envía por cada canal
        ├─ SMSChannelCreator → SMS
        └─ EmailChannelCreator → Email
```

## Uso en DashboardComponent

```typescript
// ANTES: 5 dependencias diferentes
constructor(
  private userPreferencesService: UserPreferencesService,
  private notificationService: NotificationService,
  private alertMessageBuilder: AlertMessageBuilderService,
  private authService: AuthService,
  private cdr: ChangeDetectorRef
)

// DESPUÉS: 1 dependencia (Facade)
constructor(
  private facade: AlertCenterFacadeService,
  private cdr: ChangeDetectorRef
)
```

## Responsabilidades Separadas

| Componente | Responsabilidad |
|-----------|-----------------|
| **DashboardComponent** | Renderizar UI, manejar eventos |
| **AlertCenterFacadeService** | Orquestar caso de uso del dashboard |
| **NotificationService** | Crear y enviar notificaciones (Factory Method) |
| **AlertMessageBuilderService** | Enriquecer mensajes (Decorator) |
| **UserPreferencesService** | Gestionar preferencias del usuario |

## Integración SOLID

### ✅ SRP - Single Responsibility
- Cada servicio tiene responsabilidad única
- Facade coordina, no implementa

### ✅ OCP - Open/Closed
- Agregar nuevo canal → modificar Factory Method, no Facade
- Agregar decorador → modificar builder, no Facade

### ✅ LSP - Liskov Substitution
- NotificationChannel heredable sin problemas
- AlertMessage decorator respeta interfaz

### ✅ ISP - Interface Segregation
- Interfaces cohesivas y pequeñas
- Facade expone solo métodos necesarios

### ✅ DIP - Dependency Inversion
- DashboardComponent depende de abstracción (Facade)
- Facade depende de abstracciones (interfaces)

## Patrón Facade (GoF)

Corresponde exactamente al patrón estructural Facade del Gang of Four:

```
┌─────────────────────────────────────────┐
│        DashboardComponent               │ ← Cliente
└────────────────┬────────────────────────┘
                 │ usa fachada
                 ▼
┌─────────────────────────────────────────┐
│  AlertCenterFacadeService               │ ← FACADE
└───┬──────┬──────┬──────────────────────┘
    │      │      │
    ▼      ▼      ▼
┌──────┐ ┌──────┐ ┌──────┐ ...           ← Subsistemas
│ Notif│ │Prefs │ │Builder│
└──────┘ └──────┘ └──────┘
```

**Beneficio**: El cliente (Dashboard) interactúa con una interfaz simple.
