---
name: "Risk Event Notification Agents"
description: "Registro de agentes personalizados para el proyecto de notificaciones de eventos de riesgo"
version: "1.0"
---

# 🤖 Agentes Personalizados - Risk Event Notification

## Agentes Disponibles

### 1. **PatronesComportamiento** ⭐
**Estado:** Activo | **Versión:** 1.0

**Descripción:**
Agente especializado en análisis, diseño e implementación de patrones de comportamiento (Gang of Four) para mejorar la comunicación entre componentes del sistema de notificaciones de riesgo.

**Responsabilidades:**
- Analizar la arquitectura actual e identificar problemas
- Proponer dos patrones de comportamiento con justificación
- Diseñar diagramas UML de clases específicos del dominio
- Implementar patrones en Angular respetando SOLID
- Documentar claramente para mantenimiento futuro

**Cómo Usar:**
```bash
# Ejecutar análisis de patrones
@PatronesComportamiento Analiza el proyecto y propone dos patrones de comportamiento

# Solicitar diseño UML
@PatronesComportamiento Crea los diagramas UML para los patrones identificados

# Implementación
@PatronesComportamiento Implementa los patrones en el código Angular
```

**Entrada (Trigger):**
- Mención de `patrones de comportamiento`
- Pregunta sobre comunicación entre módulos
- Solicitud de diseño de patrones
- Palabras clave: pattern, behavior, design, comunicación

**Salida (Entregables):**
- Fase 1: Análisis documentado + justificación de patrones
- Fase 2: Diagramas UML + justificación detallada
- Fase 3: Código implementado + documentación

**Archivos Asociados:**
- `.github/prompts/.agent.md` - Definición del agente
- `.github/prompts/pratron_de_comportamiento.prompt.md` - Prompt mejorado
- `.github/docs/patrones_comportamiento.md` - Requisitos

**Fases de Trabajo:**
1. **Análisis (20%)** - Identificar problemas y patrones
2. **Diseño (20%)** - Crear diagramas UML y justificación
3. **Implementación (60%)** - Codificar en Angular

---

## Instrucciones de Integración

### Para Desarrolladores
Si necesitas trabajar con patrones de comportamiento:
```bash
# Simplemente menciona al agente
"@PatronesComportamiento, ayúdame a..."
```

El agente detectará automáticamente:
- La fase en que se encuentra el proyecto
- Qué archivos existen (análisis, diagramas, código)
- Qué tareas completar a continuación

### Para Revisores
Valida que las entregas cumplan:
- ✓ Nombres de clases específicos del dominio (no genéricos)
- ✓ Diagramas UML claros con relaciones
- ✓ Principios SOLID aplicados (S, O, L, I, D)
- ✓ Integración natural con Angular
- ✓ Documentación para otros desarrolladores

---

## Configuración Técnica

**Ubicación:** `.github/prompts/.agent.md`

**Metadatos:**
- `name`: PatronesComportamiento
- `version`: 1.0
- `context`: Risk Event Notification Frontend - Angular
- `applyTo`: Archivos relacionados a patrones

**Herramientas Autorizadas:**
- ✓ Lectura de código (read_file, grep_search)
- ✓ Edición de código (create_file, replace_string_in_file)
- ✓ Análisis (get_errors, runSubagent)
- ✓ Visualización (open_browser_page para .drawio)

---

## Estado del Proyecto

### Completado ✅
- [x] Factory Method (creacional)
- [x] Facade (estructural)
- [x] Decorator (estructural)

### En Progreso 🔄
- [ ] Patrones de Comportamiento (Fase 1: Análisis)
- [ ] Patrones de Comportamiento (Fase 2: Diseño)
- [ ] Patrones de Comportamiento (Fase 3: Implementación)

### Por Hacer ⏳
- [ ] Pruebas unitarias de patrones
- [ ] Documentación de API
- [ ] Guía de extensión para nuevos patrones

---

## Referencias Rápidas

| Aspecto | Archivo | Descripción |
|---------|---------|-------------|
| Requisitos | `patrones_comportamiento.md` | Especificación completa del reto |
| Prompt Mejorado | `pratron_de_comportamiento.prompt.md` | Estructura detallada de fases |
| Definición Agente | `.agent.md` | Instrucciones de comportamiento |
| Código | `src/app/services/behavioral-patterns/` | Implementación de patrones |
| Diagramas | `*.drawio` | UML de patrones diseñados |

---

## Soporte y Extensión

### Agregar Nuevo Agente
1. Crear archivo `NombreAgente.agent.md` en `.github/prompts/`
2. Seguir estructura de metadatos YAML
3. Documentar en esta sección de `AGENTS.md`
4. Activar mediante palabras clave

### Reportar Problemas
Si el agente no se comporta como se espera:
1. Verifica que el archivo `.agent.md` tenga sintaxis YAML correcta
2. Comprueba los archivos `applyTo`
3. Revisa el campo `taskTypes`
4. Consulta las instrucciones de comportamiento

---

**Última actualización:** Mayo 22, 2026  
**Mantenedor:** Equipo de Desarrollo - Patrones de Diseño
