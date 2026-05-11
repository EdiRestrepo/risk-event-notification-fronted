import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Marca de Tiempo
 * Agrega la fecha y hora de emisión de la alerta
 * Responsabilidad: Enriquecer el cuerpo del mensaje con fecha/hora
 *
 * SRP: Solo agrega la información de timestamp, nada más
 */
export class TimestampAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private timestamp: Date) {
    super(wrappee);
  }

  override getBody(): string {
    const formattedDate = this.formatDate(this.timestamp);
    return `${this.wrappee.getBody()}\nEmitido: ${formattedDate}.`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      timestamp: this.timestamp.toISOString()
    };
  }

  /**
   * Formatea la fecha en formato legible: "23 may, 09:25"
   */
  private formatDate(date: Date): string {
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month}, ${hours}:${minutes}`;
  }
}
