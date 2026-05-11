import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Nivel de Riesgo
 * Agrega información sobre el nivel de riesgo a la alerta
 * Responsabilidad: Enriquecer el título con el nivel de riesgo
 *
 * SRP: Solo agrega el nivel de riesgo, nada más
 */
export class RiskLevelAlertDecorator extends AlertMessageDecorator {
  constructor(wrappee: AlertMessage, private riskLevel: string) {
    super(wrappee);
  }

  override getTitle(): string {
    return `[ALERTA ${this.riskLevel}] ${this.wrappee.getTitle()}`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      riskLevel: this.riskLevel
    };
  }
}
