import { TestBed } from '@angular/core/testing';
import { BaseAlertMessage } from './base-alert-message';
import { RiskLevelAlertDecorator } from './risk-level-alert.decorator';
import { LocationAlertDecorator } from './location-alert.decorator';
import { SafetyRecommendationAlertDecorator } from './safety-recommendation-alert.decorator';
import { PriorityAlertDecorator } from './priority-alert.decorator';
import { TimestampAlertDecorator } from './timestamp-alert.decorator';
import { PlainLanguageAlertDecorator } from './plain-language-alert.decorator';
import { AlertMessageBuilderService, AlertMessageFluentBuilder } from './alert-message-builder.service';
import { AlertMessage } from './alert-message.interface';

describe('Patrón Decorator - Enriquecimiento de Mensajes de Alerta', () => {

  let builderService: AlertMessageBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertMessageBuilderService]
    });
    builderService = TestBed.inject(AlertMessageBuilderService);
  });

  describe('BaseAlertMessage', () => {
    it('debe crear un mensaje base sin decoradores', () => {
      const message = new BaseAlertMessage('Título', 'Cuerpo del mensaje');

      expect(message.getTitle()).toBe('Título');
      expect(message.getBody()).toBe('Cuerpo del mensaje');
      expect(message.getMetadata()).toEqual({});
    });
  });

  describe('RiskLevelAlertDecorator', () => {
    it('debe agregar el nivel de riesgo al título', () => {
      const base = new BaseAlertMessage('Lluvias intensas', 'Alerta por lluvia');
      const decorated = new RiskLevelAlertDecorator(base, 'NARANJA');

      expect(decorated.getTitle()).toContain('[ALERTA NARANJA]');
      expect(decorated.getTitle()).toContain('Lluvias intensas');
      expect(decorated.getMetadata().riskLevel).toBe('NARANJA');
    });
  });

  describe('LocationAlertDecorator', () => {
    it('debe agregar información de ubicación al cuerpo', () => {
      const base = new BaseAlertMessage('Alerta', 'Mensaje base');
      const decorated = new LocationAlertDecorator(base, ['Medellín', 'Bello']);

      expect(decorated.getBody()).toContain('Mensaje base');
      expect(decorated.getBody()).toContain('Zona afectada: Medellín, Bello.');
      expect(decorated.getMetadata().locations).toBe('Medellín,Bello');
    });
  });

  describe('SafetyRecommendationAlertDecorator', () => {
    it('debe agregar recomendación de seguridad al cuerpo', () => {
      const base = new BaseAlertMessage('Alerta', 'Mensaje base');
      const decorated = new SafetyRecommendationAlertDecorator(
        base,
        'Manténgase en lugar seguro'
      );

      expect(decorated.getBody()).toContain('Mensaje base');
      expect(decorated.getBody()).toContain('Recomendación: Manténgase en lugar seguro');
      expect(decorated.getMetadata().safetyRecommendation).toBe('Manténgase en lugar seguro');
    });
  });

  describe('PriorityAlertDecorator', () => {
    it('debe agregar prioridad al cuerpo', () => {
      const base = new BaseAlertMessage('Alerta', 'Mensaje base');
      const decorated = new PriorityAlertDecorator(base, 'Alta');

      expect(decorated.getBody()).toContain('Mensaje base');
      expect(decorated.getBody()).toContain('Prioridad: Alta.');
      expect(decorated.getMetadata().priority).toBe('Alta');
    });
  });

  describe('TimestampAlertDecorator', () => {
    it('debe agregar timestamp formateado al cuerpo', () => {
      const date = new Date(2026, 4, 23, 9, 25); // 23 may, 09:25
      const base = new BaseAlertMessage('Alerta', 'Mensaje base');
      const decorated = new TimestampAlertDecorator(base, date);

      expect(decorated.getBody()).toContain('Mensaje base');
      expect(decorated.getBody()).toContain('Emitido:');
      expect(decorated.getMetadata().timestamp).toBe(date.toISOString());
    });
  });

  describe('PlainLanguageAlertDecorator', () => {
    it('debe agregar instrucción clara al cuerpo', () => {
      const base = new BaseAlertMessage('Alerta', 'Mensaje base');
      const decorated = new PlainLanguageAlertDecorator(base);

      expect(decorated.getBody()).toContain('Mensaje base');
      expect(decorated.getBody()).toContain('Por favor, siga las recomendaciones');
      expect(decorated.getMetadata().plainLanguage).toBe('true');
    });
  });

  describe('Composición de Decoradores', () => {
    it('debe componer múltiples decoradores en cadena', () => {
      let message: AlertMessage = new BaseAlertMessage(
        'Lluvia Intensa',
        'Se prevén lluvias intensas'
      );

      message = new RiskLevelAlertDecorator(message, 'NARANJA');
      message = new LocationAlertDecorator(message, ['Medellín']);
      message = new SafetyRecommendationAlertDecorator(message, 'Manténgase seguro');
      message = new PriorityAlertDecorator(message, 'Alta');
      message = new TimestampAlertDecorator(message, new Date());

      const title = message.getTitle();
      const body = message.getBody();
      const metadata = message.getMetadata();

      expect(title).toContain('[ALERTA NARANJA]');
      expect(body).toContain('Se prevén lluvias intensas');
      expect(body).toContain('Zona afectada: Medellín');
      expect(body).toContain('Recomendación: Manténgase seguro');
      expect(body).toContain('Prioridad: Alta');
      expect(body).toContain('Emitido:');
      expect(metadata.riskLevel).toBe('NARANJA');
      expect(metadata.priority).toBe('Alta');
    });

    it('debe mantener la responsabilidad única en cada decorador', () => {
      const base = new BaseAlertMessage('Base', 'Body');

      // Cada decorador solo debe agregar su propia información
      const withRisk = new RiskLevelAlertDecorator(base, 'ROJO');
      expect(withRisk.getMetadata()).toEqual({ riskLevel: 'ROJO' });

      const withLocation = new LocationAlertDecorator(base, ['Medellín']);
      expect(withLocation.getMetadata()).toEqual({ locations: 'Medellín' });

      // Pero cuando se componen, se acumulan
      const composed = new LocationAlertDecorator(withRisk, ['Medellín']);
      expect(composed.getMetadata()).toEqual({
        riskLevel: 'ROJO',
        locations: 'Medellín'
      });
    });
  });

  describe('AlertMessageBuilderService', () => {
    it('debe construir una alerta de lluvia intensa completa', () => {
      const alert = builderService.buildCriticalRainAlert();

      expect(alert.getTitle()).toContain('[ALERTA NARANJA]');
      expect(alert.getTitle()).toContain('Lluvias intensas');
      expect(alert.getBody()).toContain('Se prevén lluvias intensas');
      expect(alert.getBody()).toContain('Zona afectada: Medellín, Bello, Envigado');
      expect(alert.getBody()).toContain('Recomendación: Evite transitar cerca de quebradas');
      expect(alert.getBody()).toContain('Prioridad: Alta');
      expect(alert.getBody()).toContain('Emitido:');
      expect(alert.getBody()).toContain('Por favor, siga las recomendaciones');
    });

    it('debe construir una alerta de deslizamiento completa', () => {
      const alert = builderService.buildLandslideAlert();

      expect(alert.getTitle()).toContain('[ALERTA ROJO]');
      expect(alert.getBody()).toContain('Riesgo de deslizamiento');
      expect(alert.getBody()).toContain('Zona afectada: Envigado, Sabaneta');
      expect(alert.getBody()).toContain('Prioridad: Alta');
    });

    it('debe construir una alerta de inundación completa', () => {
      const alert = builderService.buildFloodAlert();

      expect(alert.getTitle()).toContain('[ALERTA NARANJA]');
      expect(alert.getBody()).toContain('Creciente súbita detectada');
      expect(alert.getBody()).toContain('Zona afectada: Medellín, Itagüí, La Estrella');
    });
  });

  describe('AlertMessageFluentBuilder', () => {
    it('debe construir una alerta personalizada de forma fluida', () => {
      const alert = builderService
        .createBuilder()
        .withTitle('Alerta Personalizada')
        .withBody('Mensaje personalizado')
        .withRiskLevel('AMARILLO')
        .withLocations(['Medellín'])
        .withPriority('Media')
        .withTimestamp()
        .build();

      expect(alert.getTitle()).toContain('[ALERTA AMARILLO]');
      expect(alert.getBody()).toContain('Mensaje personalizado');
      expect(alert.getBody()).toContain('Zona afectada: Medellín');
      expect(alert.getMetadata().priority).toBe('Media');
    });

    it('debe lanzar error si falta título o cuerpo', () => {
      const builder = builderService.createBuilder();

      expect(() => {
        builder.withTitle('Solo título').build();
      }).toThrowError('Title y Body son requeridos');

      expect(() => {
        builder.withBody('Solo cuerpo').build();
      }).toThrowError('Title y Body son requeridos');
    });

    it('debe permitir omitir decoradores opcionales', () => {
      const alert = builderService
        .createBuilder()
        .withTitle('Alerta Simple')
        .withBody('Sin decoradores opcionales')
        .build();

      const metadata = alert.getMetadata();
      expect(metadata.riskLevel).toBeUndefined();
      expect(metadata.priority).toBeUndefined();
    });
  });

  describe('Contrato AlertMessage', () => {
    it('debe mantener el contrato AlertMessage en todos los decoradores', () => {
      const decorators: Array<{ name: string; decorator: AlertMessage }> = [
        { name: 'BaseAlertMessage', decorator: new BaseAlertMessage('T', 'B') },
        { name: 'RiskLevelAlertDecorator', decorator: new RiskLevelAlertDecorator(new BaseAlertMessage('T', 'B'), 'ROJO') },
        { name: 'LocationAlertDecorator', decorator: new LocationAlertDecorator(new BaseAlertMessage('T', 'B'), ['Medellín']) },
        { name: 'SafetyRecommendationAlertDecorator', decorator: new SafetyRecommendationAlertDecorator(new BaseAlertMessage('T', 'B'), 'Precaución') },
        { name: 'PriorityAlertDecorator', decorator: new PriorityAlertDecorator(new BaseAlertMessage('T', 'B'), 'Alta') },
        { name: 'TimestampAlertDecorator', decorator: new TimestampAlertDecorator(new BaseAlertMessage('T', 'B'), new Date()) },
        { name: 'PlainLanguageAlertDecorator', decorator: new PlainLanguageAlertDecorator(new BaseAlertMessage('T', 'B')) },
      ];

      decorators.forEach(({ name, decorator }) => {
        expect(typeof decorator.getTitle()).toBe('string', `${name} debe implementar getTitle()`);
        expect(typeof decorator.getBody()).toBe('string', `${name} debe implementar getBody()`);
        expect(typeof decorator.getMetadata()).toBe('object', `${name} debe implementar getMetadata()`);
      });
    });
  });
});
