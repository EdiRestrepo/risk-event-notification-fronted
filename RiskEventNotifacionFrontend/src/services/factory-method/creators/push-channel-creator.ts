import { NotificationChannel } from '../notification-channel.interface';
import { NotificationChannelCreator } from '../notification-channel-creator';
import { PushChannel } from '../channels/push-channel';

/**
 * ConcreteCreator para el canal Push (App Alerta Valle)
 * Sobreescribe el factory method para retornar una instancia de PushChannel
 */
export class PushChannelCreator extends NotificationChannelCreator {
  createChannel(): NotificationChannel {
    return new PushChannel();
  }
}
