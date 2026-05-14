import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Recomendaciones de Seguridad
 * Agrega recomendaciones sobre qué debe hacer el usuario ante la alerta
 * Responsabilidad: Enriquecer el cuerpo del mensaje con recomendaciones
 *
 * SRP: Solo agrega las recomendaciones de seguridad, nada más
 */
export class SafetyRecommendationAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private recommendation: string) {
    super(wrappee);
  }

  override getBody(): string {
    return `${this.wrappee.getBody()}\nRecomendación: ${this.recommendation}`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      safetyRecommendation: this.recommendation
    };
  }
}
