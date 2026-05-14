import { AlertMessage } from './alert-message.interface';

/**
 * Componente concreto base
 * Implementa la interfaz AlertMessage sin decoradores
 * Parte del patrón estructural Decorator
 */
export class BaseAlertMessage implements AlertMessage {
  constructor(
    private title: string,
    private body: string
  ) {}

  getTitle(): string {
    return this.title;
  }

  getBody(): string {
    return this.body;
  }

  getMetadata(): Record<string, string> {
    return {};
  }
}
