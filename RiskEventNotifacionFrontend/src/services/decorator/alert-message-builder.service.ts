import { Injectable } from '@angular/core';
import { AlertMessage } from './alert-message.interface';
import { BaseAlertMessage } from './base-alert-message';
import { RiskLevelAlertDecorator } from './risk-level-alert.decorator';
import { LocationAlertDecorator } from './location-alert.decorator';
import { SafetyRecommendationAlertDecorator } from './safety-recommendation-alert.decorator';
import { PriorityAlertDecorator } from './priority-alert.decorator';
import { TimestampAlertDecorator } from './timestamp-alert.decorator';
import { PlainLanguageAlertDecorator } from './plain-language-alert.decorator';

/**
 * Servicio builder para construir mensajes de alerta enriquecidos con decoradores
 * Facilita la composición de decoradores sin condicionales largos
 * Parte del patrón estructural Decorator
 *
 * Responsabilidad:
 * - Orquestar la creación de AlertMessage base
 * - Aplicar decoradores de forma fluida y ordenada
 * - Proporcionar métodos factory para tipos de alerta comunes
 */
@Injectable({ providedIn: 'root' })
export class AlertMessageBuilderService {

  /**
   * Construye una alerta de lluvia intensa completamente enriquecida
   */
  buildCriticalRainAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Lluvias intensas',
      'Se prevén lluvias intensas durante las próximas horas en el Valle de Aburrá.'
    );

    message = new RiskLevelAlertDecorator(message, 'NARANJA');
    message = new LocationAlertDecorator(message, ['Medellín', 'Bello', 'Envigado']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Evite transitar cerca de quebradas y zonas de ladera.'
    );
    message = new PriorityAlertDecorator(message, 'Alta');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }

  /**
   * Construye una alerta por riesgo de deslizamiento
   */
  buildLandslideAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Riesgo de deslizamiento',
      'Se ha detectado saturación de suelos en zonas de ladera.'
    );

    message = new RiskLevelAlertDecorator(message, 'ROJO');
    message = new LocationAlertDecorator(message, ['Envigado', 'Sabaneta']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Evacúe de inmediato zonas de ladera. Solicite ayuda a las autoridades.'
    );
    message = new PriorityAlertDecorator(message, 'Alta');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }

  /**
   * Construye una alerta por aumento de nivel de río
   */
  buildFloodAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Creciente súbita detectada',
      'El nivel del río Medellín se encuentra en aumento acelerado.'
    );

    message = new RiskLevelAlertDecorator(message, 'NARANJA');
    message = new LocationAlertDecorator(message, ['Medellín', 'Itagüí', 'La Estrella']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Manténgase alejado de los cauces de agua. No traverse corrientes.'
    );
    message = new PriorityAlertDecorator(message, 'Alta');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }



  /**
   * Construye una alerta critica por terremoto.
   * Mantiene el mismo color semantico que Strategy: ROJO.
   */
  buildEarthquakeAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Alerta critica por terremoto',
      'Se detecta sismo fuerte con posible afectacion estructural en el Valle de Aburra.'
    );

    message = new RiskLevelAlertDecorator(message, 'ROJO');
    message = new LocationAlertDecorator(message, ['Medellin', 'Area Metropolitana']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Agachese, cubrase y sujetese. Alejese de ventanas y evacue solo cuando sea seguro.'
    );
    message = new PriorityAlertDecorator(message, 'Alta');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }

  /**
   * Construye una alerta critica por huracan.
   * Mantiene el mismo color semantico que Strategy: ROJO.
   */
  buildHurricaneAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Alerta critica por huracan',
      'Se proyectan vientos destructivos y lluvias extremas asociados a sistema ciclonico.'
    );

    message = new RiskLevelAlertDecorator(message, 'ROJO');
    message = new LocationAlertDecorator(message, ['Valle de Aburra']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Permanezca bajo techo, alejese de ventanas y siga instrucciones oficiales de evacuacion.'
    );
    message = new PriorityAlertDecorator(message, 'Alta');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }

  /**
   * Construye una alerta generica o informativa.
   * Mantiene el mismo color semantico que Strategy: GRIS.
   */
  buildGenericInfoAlert(): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(
      'Boletin informativo de monitoreo',
      'Monitoreo preventivo activo. No se reportan emergencias criticas en este momento.'
    );

    message = new RiskLevelAlertDecorator(message, 'GRIS');
    message = new LocationAlertDecorator(message, ['Valle de Aburra']);
    message = new SafetyRecommendationAlertDecorator(
      message,
      'Revise la informacion y mantengase atento a nuevas actualizaciones oficiales.'
    );
    message = new PriorityAlertDecorator(message, 'Baja');
    message = new TimestampAlertDecorator(message, new Date());
    message = new PlainLanguageAlertDecorator(message);

    return message;
  }

  /**
   * Constructor flexible que permite crear una alerta con decoradores selectivos
   * @param title - Título base del mensaje
   * @param body - Cuerpo base del mensaje
   * @param decorators - Función que aplicará los decoradores deseados
   */
  buildCustomAlert(
    title: string,
    body: string,
    decorators?: (message: AlertMessage) => AlertMessage
  ): AlertMessage {
    let message: AlertMessage = new BaseAlertMessage(title, body);

    if (decorators) {
      message = decorators(message);
    }

    return message;
  }

  /**
   * Constructor fluido para crear alertas personalizadas paso a paso
   */
  createBuilder(): AlertMessageFluentBuilder {
    return new AlertMessageFluentBuilder();
  }
}

/**
 * Clase fluida para construir alertas de manera encadenada
 * Ejemplo: builder.withTitle(...).withBody(...).withRiskLevel(...).build()
 */
export class AlertMessageFluentBuilder {
  private title: string = '';
  private body: string = '';
  private riskLevel: string | null = null;
  private locations: string[] = [];
  private recommendation: string | null = null;
  private priority: 'Alta' | 'Media' | 'Baja' | null = null;
  private includeTimestamp: boolean = false;
  private includePlainLanguage: boolean = false;

  withTitle(title: string): AlertMessageFluentBuilder {
    this.title = title;
    return this;
  }

  withBody(body: string): AlertMessageFluentBuilder {
    this.body = body;
    return this;
  }

  withRiskLevel(level: string): AlertMessageFluentBuilder {
    this.riskLevel = level;
    return this;
  }

  withLocations(locations: string[]): AlertMessageFluentBuilder {
    this.locations = locations;
    return this;
  }

  withRecommendation(recommendation: string): AlertMessageFluentBuilder {
    this.recommendation = recommendation;
    return this;
  }

  withPriority(priority: 'Alta' | 'Media' | 'Baja'): AlertMessageFluentBuilder {
    this.priority = priority;
    return this;
  }

  withTimestamp(): AlertMessageFluentBuilder {
    this.includeTimestamp = true;
    return this;
  }

  withPlainLanguage(): AlertMessageFluentBuilder {
    this.includePlainLanguage = true;
    return this;
  }

  build(): AlertMessage {
    if (!this.title || !this.body) {
      throw new Error('Title y Body son requeridos para construir una alerta.');
    }

    let message: AlertMessage = new BaseAlertMessage(this.title, this.body);

    if (this.riskLevel) {
      message = new RiskLevelAlertDecorator(message, this.riskLevel);
    }

    if (this.locations.length > 0) {
      message = new LocationAlertDecorator(message, this.locations);
    }

    if (this.recommendation) {
      message = new SafetyRecommendationAlertDecorator(message, this.recommendation);
    }

    if (this.priority) {
      message = new PriorityAlertDecorator(message, this.priority);
    }

    if (this.includeTimestamp) {
      message = new TimestampAlertDecorator(message, new Date());
    }

    if (this.includePlainLanguage) {
      message = new PlainLanguageAlertDecorator(message);
    }

    return message;
  }
}
