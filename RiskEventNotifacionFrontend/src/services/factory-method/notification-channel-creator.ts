import { NotificationChannel } from './notification-channel.interface';

/**
 * Creator abstracto del patrón Factory Method
 *
 * Define el factory method abstracto createChannel() que los
 * ConcreteCreators deben implementar para instanciar su canal específico.
 * También provee operaciones que usan el factory method (sendNotification).
 */
export abstract class NotificationChannelCreator {

  /**
   * Factory Method: cada ConcreteCreator decide qué canal concreto instanciar
   */
  abstract createChannel(): NotificationChannel;

  /**
   * Operación que utiliza el factory method para enviar una notificación.
   * El Creator no necesita saber qué clase concreta se crea.
   */
  sendNotification(message: string, recipient: string): void {
    const channel = this.createChannel();
    channel.send(message, recipient);
  }
}
