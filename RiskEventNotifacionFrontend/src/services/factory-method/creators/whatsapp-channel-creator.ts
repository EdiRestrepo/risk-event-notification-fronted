import { NotificationChannel } from '../notification-channel.interface';
import { NotificationChannelCreator } from '../notification-channel-creator';
import { WhatsAppChannel } from '../channels/whatsapp-channel';

/**
 * ConcreteCreator para el canal WhatsApp
 * Sobreescribe el factory method para retornar una instancia de WhatsAppChannel
 */
export class WhatsAppChannelCreator extends NotificationChannelCreator {
  createChannel(): NotificationChannel {
    return new WhatsAppChannel();
  }
}
