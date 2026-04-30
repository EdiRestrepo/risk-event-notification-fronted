import { Injectable } from '@angular/core';
import { NotificationChannel } from './notification-channel.interface';
import { NotificationChannelCreator } from './notification-channel-creator';
import { SMSChannelCreator } from './creators/sms-channel-creator';
import { EmailChannelCreator } from './creators/email-channel-creator';
import { PushChannelCreator } from './creators/push-channel-creator';
import { WhatsAppChannelCreator } from './creators/whatsapp-channel-creator';

/**
 * Coordinador del patrón Factory Method
 *
 * Mantiene un registro de ConcreteCreators y delega la creación
 * de canales a cada uno. No instancia productos concretos directamente.
 *
 * Se utiliza un registro (Map) de Creators para cumplir con el
 * Principio Open/Closed (OCP): se pueden agregar nuevos canales
 * registrando un nuevo ConcreteCreator sin modificar esta clase.
 */
@Injectable({ providedIn: 'root' })
export class NotificationChannelFactory {

  private creatorRegistry = new Map<string, NotificationChannelCreator>([
    ['sms', new SMSChannelCreator()],
    ['email', new EmailChannelCreator()],
    ['push', new PushChannelCreator()],
    ['whatsapp', new WhatsAppChannelCreator()],
  ]);

  /**
   * Obtiene el ConcreteCreator y le delega la creación del canal
   * @param channelType - Tipo de canal ('sms', 'email', 'push', 'whatsapp')
   * @returns Instancia del canal de notificación
   */
  createChannel(channelType: string): NotificationChannel {
    const type = channelType.toLowerCase();
    const creator = this.creatorRegistry.get(type);

    if (!creator) {
      throw new Error(`Canal de notificación no soportado: ${channelType}`);
    }

    return creator.createChannel();
  }

  /**
   * Registra un nuevo ConcreteCreator (OCP - extensión sin modificación)
   * @param type - Identificador del canal
   * @param creator - Instancia del ConcreteCreator
   */
  registerChannel(type: string, creator: NotificationChannelCreator): void {
    this.creatorRegistry.set(type.toLowerCase(), creator);
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
   * @returns Array de tipos de canales (sin alias)
   */
  getAvailableChannels(): string[] {
    return ['sms', 'email', 'push', 'whatsapp'];
  }
}
