import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Ubicación/Zona Afectada
 * Agrega información sobre la ubicación o municipios afectados
 * Responsabilidad: Enriquecer el cuerpo del mensaje con la ubicación
 *
 * SRP: Solo agrega la información de ubicación, nada más
 */
export class LocationAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private locations: string[]) {
    super(wrappee);
  }

  override getBody(): string {
    const locationString = this.locations.join(', ');
    return `${this.wrappee.getBody()}\nZona afectada: ${locationString}.`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      locations: this.locations.join(',')
    };
  }
}
