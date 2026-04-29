import { Injectable } from '@angular/core';
import { NotificationChannel } from './notification-channel.interface';
import {
  SMSChannel,
  EmailChannel,
  PushChannel,
  WhatsAppChannel
} from './notification-channels';

/**
 * Factory Method para crear instancias de canales de notificación
 * Patrón de diseño: Factory Method
 *
 * Este servicio implementa el patrón Factory Method que permite
 * crear diferentes tipos de canales de notificación según las
 * preferencias del usuario.
 */
@Injectable({ providedIn: 'root' })
export class NotificationChannelFactory {

  /**
   * Crea una instancia del canal de notificación especificado
   * @param channelType - Tipo de canal ('sms', 'email', 'push', 'whatsapp')
   * @returns Instancia del canal de notificación
   */
  createChannel(channelType: string): NotificationChannel {
    const type = channelType.toLowerCase();

    switch (type) {
      case 'sms':
        return new SMSChannel();

      case 'email':
        return new EmailChannel();

      case 'push':
      case 'app':
        return new PushChannel();

      case 'whatsapp':
        return new WhatsAppChannel();

      default:
        throw new Error(`Canal de notificación no soportado: ${channelType}`);
    }
  }

  /**
   * Crea múltiples canales según las preferencias del usuario
   * @param preferences - Array de tipos de canales preferidos
   * @returns Array de instancias de canales de notificación
   */
  createChannels(preferences: string[]): NotificationChannel[] {
    return preferences.map(pref => this.createChannel(pref));
  }

  /**
   * Obtiene los tipos de canales disponibles
   * @returns Array de tipos de canales
   */
  getAvailableChannels(): string[] {
    return ['sms', 'email', 'push', 'whatsapp'];
  }
}
