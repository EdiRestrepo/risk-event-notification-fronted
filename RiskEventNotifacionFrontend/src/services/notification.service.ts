import { Injectable } from '@angular/core';
import { NotificationChannelFactory } from './notification-channel.factory';
import { NotificationChannel } from './notification-channel.interface';

/**
 * Modelo para representar una notificación
 */
export interface Notification {
  id?: string;
  title: string;
  message: string;
  recipient: string;
  channels: string[]; // Array de nombres de canales ('sms', 'email', 'push', 'whatsapp')
  timestamp?: Date;
  status?: 'pending' | 'sent' | 'failed';
}

/**
 * Respuesta de envío de notificación
 */
export interface NotificationResponse {
  success: boolean;
  channel: string;
  message: string;
  timestamp: Date;
}

/**
 * Servicio de Notificación
 * Implementa el patrón Factory Method a través de NotificationChannelFactory
 * para enviar notificaciones a través de múltiples canales
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private notificationHistory: Notification[] = [];

  constructor(private channelFactory: NotificationChannelFactory) {}

  /**
   * Envía una notificación a través de los canales especificados
   * @param notification - Objeto de notificación con detalles
   * @returns Array de respuestas de envío
   */
  sendNotification(notification: Notification): NotificationResponse[] {
    const responses: NotificationResponse[] = [];

    // Generar ID único para la notificación
    const notificationId = notification.id || `notif_${Date.now()}`;

    // Iterar sobre los canales solicitados
    notification.channels.forEach(channelName => {
      try {
        // Usar la factory para crear la instancia del canal
        const channel = this.channelFactory.createChannel(channelName);

        // Enviar la notificación a través del canal
        const response = this.sendViaChannel(
          channel,
          channelName,
          notification,
          notificationId
        );

        responses.push(response);
      } catch (error) {
        // Capturar errores si el canal no existe
        responses.push({
          success: false,
          channel: channelName,
          message: `Error: Canal no soportado - ${channelName}`,
          timestamp: new Date()
        });
      }
    });

    // Guardar en historial
    notification.timestamp = new Date();
    notification.status = responses.some(r => r.success) ? 'sent' : 'failed';
    this.notificationHistory.push(notification);

    return responses;
  }

  /**
   * Envía la notificación a través de un canal específico
   * @param channel - Instancia del canal
   * @param channelName - Nombre del canal
   * @param notification - Datos de la notificación
   * @param notificationId - ID único de la notificación
   * @returns Respuesta de envío
   */
  private sendViaChannel(
    channel: NotificationChannel,
    channelName: string,
    notification: Notification,
    notificationId: string
  ): NotificationResponse {
    const message = `[${notification.title}] ${notification.message}`;

    try {
      // Enviar a través del canal
      channel.send(message, notification.recipient);

      // Crear respuesta exitosa
      const response: NotificationResponse = {
        success: true,
        channel: channel.name,
        message: `✅ Notificación enviada por ${channel.name}`,
        timestamp: new Date()
      };

      // Log en consola
      this.logNotification(response, notification, notificationId);

      return response;
    } catch (error) {
      const errorResponse: NotificationResponse = {
        success: false,
        channel: channel.name,
        message: `❌ Error al enviar por ${channel.name}: ${error}`,
        timestamp: new Date()
      };

      console.error(errorResponse);
      return errorResponse;
    }
  }

  /**
   * Registra la notificación en la consola con formato
   */
  private logNotification(
    response: NotificationResponse,
    notification: Notification,
    notificationId: string
  ): void {
    const log = {
      notificationId,
      timestamp: response.timestamp.toISOString(),
      channel: response.channel,
      title: notification.title,
      message: notification.message,
      recipient: notification.recipient,
      status: 'SENT'
    };

    console.group(`📤 ${response.channel} - Notificación Enviada`);
    console.table(log);
    console.log('Detalles completos:', log);
    console.groupEnd();
  }

  /**
   * Obtiene el historial de notificaciones
   */
  getNotificationHistory(): Notification[] {
    return [...this.notificationHistory];
  }

  /**
   * Limpia el historial de notificaciones
   */
  clearHistory(): void {
    this.notificationHistory = [];
    console.log('Historial de notificaciones limpiado');
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  getStatistics() {
    return {
      totalNotifications: this.notificationHistory.length,
      successfulNotifications: this.notificationHistory.filter(
        n => n.status === 'sent'
      ).length,
      failedNotifications: this.notificationHistory.filter(
        n => n.status === 'failed'
      ).length,
      notificationsByChannel: this.getNotificationsByChannel()
    };
  }

  /**
   * Agrupa las notificaciones por canal
   */
  private getNotificationsByChannel() {
    const byChannel: { [key: string]: number } = {};

    this.notificationHistory.forEach(notification => {
      notification.channels.forEach(channel => {
        byChannel[channel] = (byChannel[channel] || 0) + 1;
      });
    });

    return byChannel;
  }

  /**
   * Envía una notificación simple a través de múltiples canales
   * Método helper para casos de uso comunes
   */
  sendSimple(
    title: string,
    message: string,
    recipient: string,
    channels: string[]
  ): NotificationResponse[] {
    return this.sendNotification({
      title,
      message,
      recipient,
      channels
    });
  }
}
