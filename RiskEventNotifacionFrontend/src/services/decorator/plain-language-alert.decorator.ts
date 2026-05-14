import { AlertMessage } from './alert-message.interface';
import { AlertMessageDecorator } from './alert-message.decorator';

/**
 * Decorador concreto: Lenguaje Claro
 * Transforma el mensaje a un lenguaje más claro y comprensible para el usuario
 * Responsabilidad: Mejorar la legibilidad del mensaje completo
 *
 * SRP: Solo adapta el lenguaje del mensaje, nada más
 */
export class PlainLanguageAlertDecorator extends AlertMessageDecorator {
  override getBody(): string {
    const originalBody = this.wrappee.getBody();
    // Agregar una línea adicional con instrucción clara
    return `${originalBody}\n\n⚠️ Por favor, siga las recomendaciones para proteger su seguridad.`;
  }

  override getMetadata(): Record<string, string> {
    return {
      ...this.wrappee.getMetadata(),
      plainLanguage: 'true'
    };
  }
}
