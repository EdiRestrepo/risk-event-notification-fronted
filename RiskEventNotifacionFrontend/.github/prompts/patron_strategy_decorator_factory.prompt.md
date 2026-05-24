Quiero que el patrón Decorator en el frontend de RiskEventNotification se sincronice con las alertas del patrón Strategy para que las alertas del Decorator se muestren junto con las alertas del Strategy, y que ambas tengan colores y tiempos de duración consistentes. Además, quiero agregar dos nuevas estrategias de alerta para terremotos y huracanes, y asegurarme de que los canales de notificación coincidan con los que llegan desde el backend:
1. Agregar 2 Nuevas Estrategias de Alerta
Crear estrategias para:
- **Terremoto** → EarthquakeRiskAlertStrategy (ROJO, CRITICA, 40s)
- **Huracán** → HurricaneRiskAlertStrategy (ROJO, CRITICA, 40s)

Agregar a `simulatedBackendAlerts` en NotificationService.
2. Que el patron decorator tenga las mismas alertas que el strategy
3. Sincronizar Colores de las alertas del decorator y strategy 
Colores consistentes en todo el flujo:
| Tipo | Strategy | Decorator | Dashboard |
|------|----------|-----------|-----------|
| Lluvia | NARANJA | naranja | naranja |
| Inundación | NARANJA | naranja | naranja |
| Deslizamiento | ROJO | rojo | rojo |
| Terremoto | ROJO | rojo | rojo |
| Huracán | ROJO | rojo | rojo |
| Genérica | GRIS | gris | gris |
4. Que las alertas del decorator no se muestren todas a la vez, sino que se sincronicen para que se muestren junto con las alertas del strategy y que coincidan en tipo de alerta, colores de las alertas y tiempo de duracion de las alertas.
5. Que los canales de notificación coincidan con los que llegan desde el backend (igual que los simulados)
ver imagen de la interfaz del dashboard
