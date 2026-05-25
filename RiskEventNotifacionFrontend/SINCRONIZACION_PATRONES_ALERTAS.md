# Sincronización de Strategy, Observer, Decorator y Factory Method

## Cambios aplicados

1. Se agregaron las estrategias de comportamiento:
   - `EarthquakeRiskAlertStrategy`: alerta ROJA, prioridad CRÍTICA, duración 40 segundos.
   - `HurricaneRiskAlertStrategy`: alerta ROJA, prioridad CRÍTICA, duración 40 segundos.

2. `NotificationService` simula seis tipos de alerta con la estructura esperada del backend:
   - Lluvia: `eventType = 1`, color naranja.
   - Inundación: `eventType = 2`, color naranja.
   - Deslizamiento: `eventType = 3`, color rojo.
   - Genérica: `eventType = 4`, color gris.
   - Terremoto: `eventType = 5`, color rojo.
   - Huracán: `eventType = 6`, color rojo.

3. El Decorator ya no se muestra como un bloque independiente con botones de demostración. Ahora se aplica sobre la misma alerta que selecciona Strategy y que publica Observer.

4. Los colores quedaron sincronizados:

| Tipo | Strategy | Decorator | Dashboard |
|---|---|---|---|
| Lluvia | NARANJA | NARANJA | naranja |
| Inundación | NARANJA | NARANJA | naranja |
| Deslizamiento | ROJO | ROJO | rojo |
| Terremoto | ROJO | ROJO | rojo |
| Huracán | ROJO | ROJO | rojo |
| Genérica | GRIS | GRIS | gris |

5. Los canales del panel derecho se toman de `content.channels` de la alerta activa. Ya no se muestran como preferencias manuales independientes durante la simulación.

## Flujo final

```txt
Alerta del backend
        ↓
Strategy: clasifica tipo, color, prioridad y duración
        ↓
Observer: publica la alerta activa
        ↓
Decorator: enriquece la misma alerta activa
        ↓
Factory Method: crea los canales que llegan en content.channels
        ↓
Dashboard: renderiza alerta, mensaje enriquecido y canales sincronizados
```

## Validación en consola

La consola muestra el orden:

```txt
[1/4 Strategy]
[2/4 Observer]
[3/4 Decorator]
[4/4 Factory Method]
```

En `[3/4 Decorator]` se imprime el tipo de alerta decorada y el color semántico aplicado. En `[4/4 Factory Method]` se imprimen los códigos originales del backend y los canales adaptados al Factory Method.
