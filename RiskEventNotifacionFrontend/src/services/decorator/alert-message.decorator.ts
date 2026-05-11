import { AlertMessage } from './alert-message.interface';

/**
 * Decorador abstracto
 * Define la estructura base para todos los decoradores concretos
 * Parte del patrón estructural Decorator
 *
 * Responsabilidad: Envolver un AlertMessage y delegar a él,
 * permitiendo que las subclases agreguen comportamiento adicional
 */
export abstract class AlertMessageDecorator implements AlertMessage {
  constructor(protected wrappee: AlertMessage) {}

  getTitle(): string {
    return this.wrappee.getTitle();
  }

  getBody(): string {
    return this.wrappee.getBody();
  }

  getMetadata(): Record<string, string> {
    return this.wrappee.getMetadata();
  }
}
