---
name: "Patrones de Comportamiento - Análisis e Implementación"
description: "Agente para identificar, justificar, diseñar e implementar patrones de comportamiento en la aplicación de notificaciones de eventos de riesgo"
version: "1.0"
context: "Risk Event Notification Frontend - Angular"
---

# Análisis e Implementación de Patrones de Comportamiento

## Contexto del Proyecto

**Reto:** Sistema de notificaciones de eventos de riesgo para Medellín y Valle de Aburrá
- **Objetivo:** Mejorar la comunicación entre componentes del sistema de notificaciones de riesgo
- **Contexto:** Ya implementados patrones creacionales (Factory Method) y estructurales (Facade, Decorator)
- **Componentes Principales:**
  - Módulo de detección de eventos
  - Módulo de procesamiento de datos
  - Módulo de generación de notificaciones
  - Módulo de envío de notificaciones

## Patrones de Comportamiento Disponibles

- Chain of Responsibility
- Command
- Iterator
- Mediator
- Memento
- Event Sourcing
- State
- Strategy
- Template Method
- Visitor

## Fases de Ejecución

### FASE 1: Análisis e Identificación (20%)

**Objetivo:** Identificar dos problemas/funcionalidades concretos que requieran patrones de comportamiento

**Tareas:**
1. Analizar la arquitectura actual del proyecto (componentes y flujos de comunicación)
2. Identificar dos problemas o funcionalidades específicas donde la comunicación entre módulos sea crítica
3. Para cada problema, seleccionar el patrón de comportamiento más apropiado

**Criterios de Éxito:**
- [ ] Dos problemas claramente identificados y documentados
- [ ] Cada problema está asociado a un componente o flujo específico del sistema
- [ ] Justificación clara de por qué cada patrón resuelve el problema

**Entregables:**
- Análisis detallado de cada problema
- Recomendación de patrón con justificación
- Comparación: cuál de los dos patrones tiene mayor aplicabilidad en el contexto del reto

### FASE 2: Justificación y Diseño (20%)

**Objetivo:** Fundamentar las selecciones y crear diagramas UML

**Tareas:**
1. Justificar por qué cada patrón se adapta a las necesidades específicas del proyecto
2. Explicar cómo el patrón mejora la comunicación entre componentes
3. Crear dos diagramas UML de clases (uno por cada patrón)
4. Usar nombres de clases específicos del dominio (NO genéricos)

**Criterios de Éxito:**
- [ ] Justificación de cada patrón con referencias a principios SOLID
- [ ] Análisis de cómo cada patrón resuelve problemas de comunicación específicos
- [ ] Dos diagramas UML claros y detallados
- [ ] Nomenclatura coherente con el dominio del proyecto

**Entregables:**
- Documento de justificación (Parte A)
- Dos diagramas UML (.drawio o equivalente)

### FASE 3: Implementación en el Proyecto (60%)

**Objetivo:** Codificar los patrones en Angular, respetando SOLID

**Tareas:**
1. Crear las clases necesarias para cada patrón
2. Implementar la lógica de comportamiento
3. Integrar con la estructura angular actual (servicios, componentes)
4. Asegurar correcto uso de los patrones
5. Seguir principios SOLID en toda la implementación

**Criterios de Éxito:**
- [ ] Código compilable y sin errores
- [ ] Patrones claramente implementados y funcionales
- [ ] Principios SOLID aplicados (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- [ ] Integración natural con la arquitectura Angular existente


**Estructura de Carpetas Sugerida:**
```
src/app/services/
├── behavioral-patterns/
│   ├── pattern1-name/
│   │   ├── interfaces/
│   │   ├── classes/
│   │   └── README.md
│   └── pattern2-name/
│       ├── interfaces/
│       ├── classes/
│       └── README.md
```

**Entregables:**
- Código implementado con estructura clara
- Documentación de uso para cada patrón
- Ejemplos de integración en servicios/componentes

## Criterios Generales de Evaluación

✅ **Claridad Conceptual:** ¿Se entiende claramente qué patrón se implementó y por qué?
✅ **Relevancia:** ¿Los patrones realmente mejoran la comunicación entre componentes?
✅ **Calidad de Código:** ¿El código es limpio, legible y sigue SOLID?
✅ **Integración:** ¿Se integra naturalmente con Angular y la arquitectura existente?
✅ **Documentación:** ¿Está claro cómo se usan los patrones?

## Preguntas Guía para el Análisis

1. ¿Qué problema de comunicación existe entre módulos actualmente?
2. ¿Cómo reduciría el patrón X ese acoplamiento?
3. ¿Cuál es el flujo de datos o eventos que se beneficiaría del patrón?
4. ¿Cómo se integra el patrón con los servicios Angular existentes?
5. ¿Sigue la implementación los cinco principios SOLID?
