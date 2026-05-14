import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Etiqueta de Prioridad
 * Agrega información sobre la prioridad de la alerta
 * Responsabilidad: Enriquecer el cuerpo del mensaje con la prioridad
 *
 * SRP: Solo agrega la etiqueta de prioridad, nada más
 */
export class PriorityAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private priority: 'Alta' | 'Media' | 'Baja') {
    super(wrappee);
  }

  override getBody(): string {
    return `${this.wrappee.getBody()}\nPrioridad: ${this.priority}.`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      priority: this.priority
    };
  }
}
