import { Injectable } from '@angular/core';
import { NotificationChannelFactory } from './notification-channel.factory';
import { NotificationChannel } from './notification-channel.interface';

/**
 * Modelo para las preferencias de notificación del usuario
 */
export interface UserNotificationPreferences {
  userId: string;
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  activeChannels: NotificationChannel[];
}

/**
 * Servicio para gestionar las preferencias de notificación del usuario
 * Utiliza el patrón Factory Method a través de NotificationChannelFactory
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {

  private userPreferences: UserNotificationPreferences = {
    userId: 'user_001',
    channels: {
      sms: true,
      email: true,
      push: true,
      whatsapp: false
    },
    activeChannels: []
  };

  constructor(private channelFactory: NotificationChannelFactory) {
    this.initializeChannels();
  }

  /**
   * Inicializa los canales activos basados en las preferencias del usuario
   */
  private initializeChannels(): void {
    const activeChannelNames: string[] = [];

    if (this.userPreferences.channels.sms) activeChannelNames.push('sms');
    if (this.userPreferences.channels.email) activeChannelNames.push('email');
    if (this.userPreferences.channels.push) activeChannelNames.push('push');
    if (this.userPreferences.channels.whatsapp) activeChannelNames.push('whatsapp');

    // Utiliza la factory para crear los canales
    this.userPreferences.activeChannels = this.channelFactory.createChannels(activeChannelNames);
  }

  /**
   * Obtiene las preferencias del usuario
   */
  getPreferences(): UserNotificationPreferences {
    return this.userPreferences;
  }

  /**
   * Actualiza las preferencias del usuario
   * @param preferences - Nuevas preferencias a aplicar
   */
  updatePreferences(preferences: Partial<UserNotificationPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.initializeChannels();
  }

  /**
   * Habilita un canal específico
   * @param channelName - Nombre del canal a habilitar
   */
  enableChannel(channelName: keyof typeof this.userPreferences.channels): void {
    this.userPreferences.channels[channelName] = true;
    this.initializeChannels();
  }

  /**
   * Deshabilita un canal específico
   * @param channelName - Nombre del canal a deshabilitar
   */
  disableChannel(channelName: keyof typeof this.userPreferences.channels): void {
    this.userPreferences.channels[channelName] = false;
    this.initializeChannels();
  }

  /**
   * Envía una notificación a través de todos los canales activos
   * @param message - Mensaje a enviar
   * @param recipient - Destinatario de la notificación
   */
  sendNotification(message: string, recipient: string): void {
    this.userPreferences.activeChannels.forEach(channel => {
      if (channel.isActive()) {
        channel.send(message, recipient);
      }
    });
  }

  /**
   * Obtiene los canales activos del usuario
   */
  getActiveChannels(): NotificationChannel[] {
    return this.userPreferences.activeChannels;
  }

  /**
   * Obtiene información sobre los canales disponibles
   */
  getChannelsInfo() {
    return {
      sms: {
        name: 'SMS',
        icon: 'bi-chat-left-dots-fill',
        color: '#25d366',
        active: this.userPreferences.channels.sms
      },
      email: {
        name: 'Correo Electrónico',
        icon: 'bi-envelope-fill',
        color: '#ea4335',
        active: this.userPreferences.channels.email
      },
      push: {
        name: 'App Alerta Valle',
        icon: 'bi-phone-fill',
        color: '#0066cc',
        active: this.userPreferences.channels.push
      },
      whatsapp: {
        name: 'WhatsApp',
        icon: 'bi-chat-bubble-fill',
        color: '#0a7e5c',
        active: this.userPreferences.channels.whatsapp
      }
    };
  }
}
