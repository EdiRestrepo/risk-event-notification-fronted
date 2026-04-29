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
 * Patrón de diseño: Factory Method (Parameterized)
 *
 * Este servicio implementa el patrón Factory Method que permite
 * crear diferentes tipos de canales de notificación según las
 * preferencias del usuario.
 *
 * Se utiliza un registro (Map) en lugar de switch/case para cumplir
 * con el Principio Open/Closed (OCP): se pueden agregar nuevos canales
 * sin modificar la clase, usando registerChannel().
 */
@Injectable({ providedIn: 'root' })
export class NotificationChannelFactory {

  private channelRegistry = new Map<string, () => NotificationChannel>([
    ['sms', () => new SMSChannel()],
    ['email', () => new EmailChannel()],
    ['push', () => new PushChannel()],
    ['app', () => new PushChannel()],
    ['whatsapp', () => new WhatsAppChannel()],
  ]);

  /**
   * Crea una instancia del canal de notificación especificado
   * @param channelType - Tipo de canal ('sms', 'email', 'push', 'whatsapp')
   * @returns Instancia del canal de notificación
   */
  createChannel(channelType: string): NotificationChannel {
    const type = channelType.toLowerCase();
    const creator = this.channelRegistry.get(type);

    if (!creator) {
      throw new Error(`Canal de notificación no soportado: ${channelType}`);
    }

    return creator();
  }

  /**
   * Registra un nuevo tipo de canal de notificación (OCP - extensión sin modificación)
   * @param type - Identificador del canal
   * @param creator - Función creadora que retorna la instancia del canal
   */
  registerChannel(type: string, creator: () => NotificationChannel): void {
    this.channelRegistry.set(type.toLowerCase(), creator);
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
