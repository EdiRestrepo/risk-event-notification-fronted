# Risk event notification fronted

## Reto 1.
En Medellín y el Valle de Aburrá, las lluvias intensas generan emergencias como inundaciones y deslizamientos. Aunque el SIATA emite alertas en tiempo real, muchas personas no las reciben, comprenden o atienden oportunamente, lo que aumenta el riesgo. El reto del curso es crear una plataforma que permita notificar a las personas sobre eventos de riesgo.

## Descripción:

Aplicación web que muestra alertas de riesgo en tiempo real, permite a los usuarios gestionar sus zonas de interés y recibir notificaciones claras y oportunas mediante interfaces intuitivas, mapas y paneles informativos. 

## Arquitectura general del sistema

**Cliente-Servidor + Monolito modular + enfoque orientado a eventos**

Se selecciona una arquitectura **cliente-servidor** porque la solución requiere una interfaz de usuario separada del procesamiento centralizado de alertas y notificaciones.

## Arquitectura del frontend

En el frontend se propone SPA (Single-Page-Application) con una arquitectura basada en componentes y funcionalidades, ya que mejora la organización del código, la escalabilidad y el mantenimiento de una aplicación con múltiples módulos como alertas, mapa, historial y configuración de usuario.

Es beneficiosa porque permite dividir una aplicación compleja en partes más pequeñas e independientes. Esto facilita el desarrollo paralelo por equipos, mejora la escalabilidad, permite actualizaciones parciales sin detener todo el sistema y optimiza la reutilización de código.

**(Micro-frontends):** Diferentes equipos pueden trabajar en módulos separados (ej. carrito de compras, perfil de usuario)

**Mejor rendimiento (Lazy Loading):** Se aplica code splitting (división de código), lo que significa que el usuario solo carga los módulos que necesita en cada momento, acelerando la carga inicial.

---
## Estructura de carpetas  para Frontend

## Angular

```bash
frontend/
└── src/
    ├── app/
    │   ├── core/
    │   │   ├── config/
    │   │   ├── guards/
    │   │   ├── services/
    │   │   ├── layout/
    │   │   └── models/
    │   │
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── directives/
    │   │   ├── pipes/
    │   │   ├── utils/
    │   │   └── types/
    │   │
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │   ├── store/
    │   │   │
    │   │   ├── dashboard/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │
    │   │   ├── alerts/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │   ├── store/
    │   │   │
    │   │   ├── map/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │   └── map.routes.ts
    │   │   │
    │   │   ├── notifications/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │   ├── store/
    │   │   │   └── notifications.routes.ts
    │   │   │
    │   │   ├── zones/
    │   │   │   ├── pages/
    │   │   │   ├── components/
    │   │   │   ├── services/
    │   │   │   ├── models/
    │   │   │   └── zones.routes.ts
    │   │   │
    │   │   ├── profile/
    │   │       ├── pages/
    │   │       ├── components/
    │   │       ├── services/
    │   │       ├── models/
    │   │       └── profile.routes.ts
    │   │
    │   ├── app.routes.ts
    │   ├── app.component.ts
    │   └── app.config.ts
    │
    ├── assets/
    ├── environments/
    └── styles/
```

---


