import { NotificationChannel } from '../notification-channel.interface';
import { NotificationChannelCreator } from '../notification-channel-creator';
import { SMSChannel } from '../channels/sms-channel';

/**
 * ConcreteCreator para el canal SMS
 * Sobreescribe el factory method para retornar una instancia de SMSChannel
 */
export class SMSChannelCreator extends NotificationChannelCreator {
  createChannel(): NotificationChannel {
    return new SMSChannel();
  }
}
