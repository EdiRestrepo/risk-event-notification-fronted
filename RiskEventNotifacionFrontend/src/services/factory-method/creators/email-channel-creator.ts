import { NotificationChannel } from '../notification-channel.interface';
import { NotificationChannelCreator } from '../notification-channel-creator';
import { EmailChannel } from '../channels/email-channel';

/**
 * ConcreteCreator para el canal Email
 * Sobreescribe el factory method para retornar una instancia de EmailChannel
 */
export class EmailChannelCreator extends NotificationChannelCreator {
  createChannel(): NotificationChannel {
    return new EmailChannel();
  }
}
