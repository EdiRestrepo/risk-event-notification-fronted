import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationChannel } from './factory-method/notification-channel.interface';
import { NotificationChannelCreator } from './factory-method/notification-channel-creator';
import { SMSChannelCreator } from './factory-method/creators/sms-channel-creator';
import { EmailChannelCreator } from './factory-method/creators/email-channel-creator';
import { PushChannelCreator } from './factory-method/creators/push-channel-creator';
import { WhatsAppChannelCreator } from './factory-method/creators/whatsapp-channel-creator';
import * as signalR from '@microsoft/signalr';

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
 * Modelo para alertas recibidas en tiempo real desde SignalR
 */
export interface RealTimeAlert {
  id: string;
  message: string;
  timestamp: Date;
  simulated: boolean;
}

/**
 * Servicio de Notificación
 * Implementa el patrón Factory Method a través de NotificationChannelFactory
 * para enviar notificaciones a través de múltiples canales
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private hubConnection!: signalR.HubConnection;
  private notificationHistory: Notification[] = [];
  private alertsSubject = new BehaviorSubject<RealTimeAlert[]>([]);
  private simulationInterval: any = null;
  private isBackendConnected = false;

  /** Observable público de alertas activas (usar con async pipe en la vista) */
  public alerts$: Observable<RealTimeAlert[]> = this.alertsSubject.asObservable();

  /** Mensajes simulados para cuando el backend no está disponible */
  private simulatedMessages: string[] = [
    'Lluvias intensas previstas en el Valle de Aburrá durante las próximas horas',
    'Riesgo de deslizamiento en zona rural de Bello - Precaución',
    'Nivel del río Medellín en aumento - Monitoreo activo',
    'Alerta por creciente súbita en quebrada La Iguaná',
    'Probabilidad de granizada en zona nororiental de Medellín',
    'Vientos fuertes esperados en las próximas 2 horas - Zona sur',
    'Monitoreo activo de quebrada Santa Elena por lluvias acumuladas',
    'Alerta temprana por saturación de suelos en Envigado'
  ];

  constructor(private ngZone: NgZone) {}
  /** Registro de ConcreteCreators — el cliente trabaja con el tipo abstracto Creator */
  private creators = new Map<string, NotificationChannelCreator>([
    ['sms', new SMSChannelCreator()],
    ['email', new EmailChannelCreator()],
    ['push', new PushChannelCreator()],
    ['whatsapp', new WhatsAppChannelCreator()],
  ]);

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
        // Usar el ConcreteCreator para crear la instancia del canal
        const creator = this.creators.get(channelName);
        if (!creator) throw new Error(`Canal no soportado: ${channelName}`);
        const channel = creator.createChannel();

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

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44357/notificationHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR conectado - Usando alertas del backend');
        this.isBackendConnected = true;
        this.stopSimulation();
      })
      .catch(err => {
        console.warn('Backend no disponible, activando modo simulación:', err.message);
        this.isBackendConnected = false;
        //this.startSimulation();
      });

    // Si se reconecta, detener simulación
    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconectado - Deteniendo simulación');
      this.isBackendConnected = true;
      this.stopSimulation();
    });

    // Si se desconecta, iniciar simulación
    this.hubConnection.onclose(() => {
      console.warn('SignalR desconectado - Activando simulación');
      this.isBackendConnected = false;
      //this.startSimulation();
    });
  }

  stopConnection() {
    this.stopSimulation();
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR desconectado'));
    }
  }

  receiveNotifications() {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      window.alert("Has recibido una nueva alerta");
      const alert: RealTimeAlert = {
        id: `alert_${Date.now()}`,
        message,
        timestamp: new Date(),
        simulated: false
      };
      this.pushAlert(alert);
      console.log('📡 Notificación del backend:', message);
    });
  }

  /**
   * Agrega una alerta al array y programa su auto-eliminación.
   * Todo se ejecuta dentro de NgZone para forzar detección de cambios.
   */
  private pushAlert(alert: RealTimeAlert): void {
    this.ngZone.run(() => {
      const updated = [alert, ...this.alertsSubject.value];
      this.alertsSubject.next(updated);

      const duration = alert.simulated ? 10000 : 20000;
      setTimeout(() => {
        this.ngZone.run(() => {
          this.removeAlert(alert.id);
        });
      }, duration);
    });
  }

  /**
   * Elimina una alerta del array por ID
   */
  removeAlert(alertId: string): void {
    const updated = this.alertsSubject.value.filter(a => a.id !== alertId);
    this.alertsSubject.next(updated);
  }

  /**
   * Inicia la simulación de alertas cada 20 segundos
   */
  private startSimulation(): void {
    if (this.simulationInterval) return; // Ya está corriendo

    console.log('🔄 Simulación de alertas iniciada (cada 20s)');
    // Emitir primera alerta inmediatamente
    this.emitSimulatedAlert();

    this.simulationInterval = setInterval(() => {
      this.emitSimulatedAlert();
    }, 20000);
  }

  /**
   * Detiene la simulación de alertas
   */
  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('🔄 Simulación de alertas detenida');
    }
  }

  /**
   * Emite una alerta simulada aleatoria
   */
  private emitSimulatedAlert(): void {
    const randomIndex = Math.floor(Math.random() * this.simulatedMessages.length);
    const alert: RealTimeAlert = {
      id: `sim_${Date.now()}`,
      message: this.simulatedMessages[randomIndex],
      timestamp: new Date(),
      simulated: true
    };
    this.pushAlert(alert);
    console.log('🧪 Alerta simulada:', alert.message);
  }
}
