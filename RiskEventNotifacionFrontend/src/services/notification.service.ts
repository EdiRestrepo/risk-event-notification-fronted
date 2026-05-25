import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationChannel } from './factory-method/notification-channel.interface';
import { NotificationChannelCreator } from './factory-method/notification-channel-creator';
import { SMSChannelCreator } from './factory-method/creators/sms-channel-creator';
import { EmailChannelCreator } from './factory-method/creators/email-channel-creator';
import { PushChannelCreator } from './factory-method/creators/push-channel-creator';
import { WhatsAppChannelCreator } from './factory-method/creators/whatsapp-channel-creator';
import * as signalR from '@microsoft/signalr';
import { RiskAlertEventBusService } from './behavioral/observer/risk-alert-event-bus.service';
import { AlertPresentationResolverService } from './behavioral/strategy/alert-presentation-resolver.service';
import { AlertPatternIntegrationService } from './behavioral/integration/alert-pattern-integration.service';
import { ALERT_SIMULATION_INTERVAL_MILLISECONDS } from './models/risk-alert.model';
import type { BackendRiskAlertNotification, RealTimeAlert } from './models/risk-alert.model';

export type { BackendRiskAlertContent, BackendRiskAlertNotification, RealTimeAlert } from './models/risk-alert.model';

/**
 * Modelo para representar una notificacion enviada por canales.
 */
export interface Notification {
  id?: string;
  title: string;
  message: string;
  recipient: string;
  channels: string[];
  timestamp?: Date;
  status?: 'pending' | 'sent' | 'failed';
}

/**
 * Respuesta de envio de notificacion.
 */
export interface NotificationResponse {
  success: boolean;
  channel: string;
  message: string;
  timestamp: Date;
}

/**
 * Servicio de Notificacion.
 *
 * Mantiene intacto el uso de Factory Method para enviar notificaciones por
 * SMS, Email, Push y WhatsApp.
 *
 * Para el reto de comportamiento:
 * - Observer: publica alertas en RiskAlertEventBusService.
 * - Strategy: consulta AlertPresentationResolverService para saber cuanto
 *   tiempo debe permanecer visible la alerta.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection?: signalR.HubConnection;
  private notificationHistory: Notification[] = [];
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private simulationIndex = 0;
  private readonly autoRemoveTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Mientras no exista comunicacion real con backend, este flag mantiene el
   * sistema trabajando con respuestas simuladas que respetan el contrato real.
   */
  private readonly simulationModeEnabled = true;

  /** Observable publico de alertas activas para usar con async pipe. */
  public get alerts$(): Observable<RealTimeAlert[]> {
    return this.alertEventBus.alerts$;
  }

  /**
   * Alertas de prueba con la misma estructura que enviara el backend.
   * Cada emision clona una plantilla, genera id nuevo y actualiza fechas.
   */
  private readonly simulatedBackendAlerts: BackendRiskAlertNotification[] = [
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000001',
        eventType: 1,
        riskLevel: 3,
        title: 'Alerta por lluvias intensas',
        message: 'Se reportan lluvias intensas con posible riesgo de inundacion en la zona.',
        location: 'Medellin - Valle de Aburra',
        source: 'SIATA',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Evite transitar por zonas inundables.',
          'No cruce quebradas o corrientes de agua.'
        ],
        channels: [1, 2, 3]
      }
    },
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000002',
        eventType: 2,
        riskLevel: 3,
        title: 'Creciente subita en quebrada',
        message: 'Aumento rapido del nivel de la quebrada La Iguana por lluvia acumulada.',
        location: 'Medellin - Comuna 13',
        source: 'SIATA',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Alejese del cauce de la quebrada.',
          'Dirijase a zonas altas y seguras.',
          'Reporte emergencias a los organismos de socorro.'
        ],
        channels: [1, 2, 3, 4]
      }
    },
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000003',
        eventType: 3,
        riskLevel: 4,
        title: 'Riesgo de deslizamiento',
        message: 'Saturacion de suelos en zona de ladera con posible movimiento en masa.',
        location: 'Bello - Sector rural',
        source: 'SIATA',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Evacue si observa grietas, inclinacion de arboles o ruidos inusuales.',
          'Evite permanecer cerca de taludes.',
          'Siga las indicaciones de gestion del riesgo.'
        ],
        channels: [1, 2, 3, 4]
      }
    },
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000004',
        eventType: 5,
        riskLevel: 4,
        title: 'Alerta critica por terremoto',
        message: 'Se detecta sismo fuerte con posible afectacion estructural en el Valle de Aburra.',
        location: 'Medellin - Area Metropolitana',
        source: 'SIATA / SGC',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Agachese, cubrase y sujetese durante el movimiento.',
          'Alejese de ventanas, postes y fachadas.',
          'Evacue solo cuando el movimiento haya terminado y sea seguro.'
        ],
        channels: [1, 2, 3, 4]
      }
    },
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000005',
        eventType: 6,
        riskLevel: 4,
        title: 'Alerta critica por huracan',
        message: 'Se proyectan vientos destructivos y lluvias extremas asociados a sistema ciclonico.',
        location: 'Valle de Aburra',
        source: 'SIATA / IDEAM',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Permanezca bajo techo y lejos de ventanas.',
          'Asegure objetos que puedan ser arrastrados por el viento.',
          'Siga las rutas de evacuacion si las autoridades lo ordenan.'
        ],
        channels: [1, 2, 3, 4]
      }
    },
    {
      title: 'Nueva alerta de riesgo',
      content: {
        id: '00000000-0000-0000-0000-000000000006',
        eventType: 4,
        riskLevel: 1,
        title: 'Boletin informativo de monitoreo',
        message: 'Monitoreo preventivo activo. No se reportan emergencias criticas en este momento.',
        location: 'Valle de Aburra',
        source: 'SIATA',
        createdAt: '2026-05-12T22:23:00',
        expiresAt: '2026-05-13T02:23:00',
        status: 'Active',
        instructions: [
          'Mantengase informado por canales oficiales.',
          'Actualice sus preferencias de notificacion.'
        ],
        channels: [3]
      }
    }
  ];

  constructor(
    private ngZone: NgZone,
    private alertEventBus: RiskAlertEventBusService,
    private alertPresentationResolver: AlertPresentationResolverService,
    private alertPatternIntegration: AlertPatternIntegrationService
  ) {}

  /** Registro de ConcreteCreators: el cliente trabaja con el Creator abstracto. */
  private creators = new Map<string, NotificationChannelCreator>([
    ['sms', new SMSChannelCreator()],
    ['email', new EmailChannelCreator()],
    ['push', new PushChannelCreator()],
    ['whatsapp', new WhatsAppChannelCreator()]
  ]);

  /**
   * Envia una notificacion a traves de los canales especificados.
   */
  sendNotification(notification: Notification): NotificationResponse[] {
    const responses: NotificationResponse[] = [];
    const notificationId = notification.id || `notif_${Date.now()}`;

    notification.channels.forEach(channelName => {
      try {
        const creator = this.creators.get(channelName);
        if (!creator) throw new Error(`Canal no soportado: ${channelName}`);

        const channel = creator.createChannel();
        const response = this.sendViaChannel(
          channel,
          channelName,
          notification,
          notificationId
        );

        responses.push(response);
      } catch (error) {
        responses.push({
          success: false,
          channel: channelName,
          message: `Error: Canal no soportado - ${channelName}`,
          timestamp: new Date()
        });
      }
    });

    notification.timestamp = new Date();
    notification.status = responses.some(r => r.success) ? 'sent' : 'failed';
    this.notificationHistory.push(notification);

    return responses;
  }

  private sendViaChannel(
    channel: NotificationChannel,
    channelName: string,
    notification: Notification,
    notificationId: string
  ): NotificationResponse {
    const message = `[${notification.title}] ${notification.message}`;

    try {
      channel.send(message, notification.recipient);

      const response: NotificationResponse = {
        success: true,
        channel: channel.name,
        message: `Notificacion enviada por ${channel.name}`,
        timestamp: new Date()
      };

      this.logNotification(response, notification, notificationId);
      return response;
    } catch (error) {
      const errorResponse: NotificationResponse = {
        success: false,
        channel: channel.name,
        message: `Error al enviar por ${channel.name}: ${error}`,
        timestamp: new Date()
      };

      console.error(errorResponse);
      return errorResponse;
    }
  }

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
      status: response.success ? 'SENT' : 'FAILED'
    };

    console.group(`${response.channel} - Notificacion enviada`);
    console.table(log);
    console.log('Detalles completos:', log);
    console.groupEnd();
  }

  getNotificationHistory(): Notification[] {
    return [...this.notificationHistory];
  }

  clearHistory(): void {
    this.notificationHistory = [];
    console.log('Historial de notificaciones limpiado');
  }

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

  private getNotificationsByChannel() {
    const byChannel: { [key: string]: number } = {};

    this.notificationHistory.forEach(notification => {
      notification.channels.forEach(channel => {
        byChannel[channel] = (byChannel[channel] || 0) + 1;
      });
    });

    return byChannel;
  }

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

  startConnection(): void {
    if (this.simulationModeEnabled) {
      console.log('Modo simulacion activo: se emitira una alerta cada 20 segundos.');
      this.startSimulation();
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44357/notificationHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR conectado - usando alertas del backend');
        this.stopSimulation();
      })
      .catch(err => {
        console.warn('Backend no disponible, activando modo simulacion:', err.message);
        this.startSimulation();
      });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconectado - deteniendo simulacion');
      this.stopSimulation();
    });

    this.hubConnection.onclose(() => {
      console.warn('SignalR desconectado - activando simulacion');
      this.startSimulation();
    });
  }

  stopConnection(): void {
    this.stopSimulation();
    this.clearAutoRemoveTimeouts();
    this.alertEventBus.clearAlerts();

    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR desconectado'));
    }
  }

  receiveNotifications(): void {
    if (!this.hubConnection) {
      console.info('SignalR no inicializado porque el frontend esta en modo simulacion.');
      return;
    }

    this.hubConnection.on('ReceiveNotification', (payload: BackendRiskAlertNotification | string) => {
      const backendAlert = this.normalizeBackendPayload(payload);
      const alert: RealTimeAlert = {
        ...backendAlert,
        receivedAt: new Date(),
        simulated: false
      };

      this.pushAlert(alert);
      console.log('Notificacion recibida desde backend:', alert);
    });
  }

  private pushAlert(alert: RealTimeAlert): void {
    this.ngZone.run(() => {
      const presentation = this.alertPresentationResolver.resolve(alert);
      console.log('[1/4 Strategy] Estrategia seleccionada para la alerta', {
        alertId: alert.content.id,
        eventType: alert.content.eventType,
        strategyVisualClass: presentation.visualClass,
        riskLabel: presentation.riskLabel,
        priority: presentation.priority,
        autoCloseMilliseconds: presentation.autoCloseMilliseconds
      });

      this.alertEventBus.publishAlert(alert);
      console.log('[2/4 Observer] RiskAlertEventBusService notifico a los suscriptores', {
        alertId: alert.content.id,
        activeAlerts: this.alertEventBus.getSnapshot().length
      });

      const decorated = this.alertPatternIntegration.decorateAlert(presentation);
      console.log('[3/4 Decorator] AlertMessageBuilder enriquecio el mensaje', {
        alertId: alert.content.id,
        decoratorAlertType: decorated.decoratorAlertType,
        decoratorRiskLevel: decorated.decoratorRiskLevel,
        strategyVisualClass: presentation.visualClass,
        decoratedTitle: decorated.decoratedTitle,
        metadata: decorated.decoratedMessageObject.getMetadata()
      });

      const notification: Notification = {
        id: alert.content.id,
        title: decorated.decoratedTitle,
        message: decorated.decoratedMessage,
        recipient: 'usuario-dashboard-simulado',
        channels: decorated.factoryChannels
      };

      console.log('[4/4 Factory Method] Canales creados segun codigos de la alerta', {
        alertId: alert.content.id,
        channelCodes: alert.content.channels,
        factoryChannels: notification.channels
      });
      this.sendNotification(notification);

      const timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.removeAlert(alert.content.id);
        });
      }, presentation.autoCloseMilliseconds);

      this.autoRemoveTimeouts.set(alert.content.id, timeoutId);
    });
  }

  removeAlert(alertId: string): void {
    const timeoutId = this.autoRemoveTimeouts.get(alertId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.autoRemoveTimeouts.delete(alertId);
    }

    this.alertEventBus.removeAlert(alertId);
  }

  private startSimulation(): void {
    if (this.simulationInterval) return;

    console.log('Simulacion de alertas iniciada: intervalo 20s. Auto-close definido por Strategy: 5s para naranja/gris y 40s para criticas.');
    this.emitSimulatedAlert();

    this.simulationInterval = setInterval(() => {
      this.emitSimulatedAlert();
    }, ALERT_SIMULATION_INTERVAL_MILLISECONDS);
  }

  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('Simulacion de alertas detenida');
    }
  }

  private emitSimulatedAlert(): void {
    const template = this.simulatedBackendAlerts[
      this.simulationIndex % this.simulatedBackendAlerts.length
    ];
    this.simulationIndex += 1;

    const alert = this.createRealTimeAlertFromTemplate(template);
    this.pushAlert(alert);

    console.log('Alerta simulada con estructura de backend:', alert);
  }

  private createRealTimeAlertFromTemplate(template: BackendRiskAlertNotification): RealTimeAlert {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      title: template.title,
      content: {
        ...template.content,
        id: this.createAlertId(),
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      },
      receivedAt: now,
      simulated: true
    };
  }

  private normalizeBackendPayload(payload: BackendRiskAlertNotification | string): BackendRiskAlertNotification {
    if (typeof payload !== 'string') {
      return payload;
    }

    try {
      const parsed = JSON.parse(payload) as BackendRiskAlertNotification;
      if (parsed?.content?.id) {
        return parsed;
      }
    } catch {
      // Si el backend legacy envia solo texto, se adapta al contrato nuevo.
    }

    const now = new Date();
    return {
      title: 'Nueva alerta de riesgo',
      content: {
        id: this.createAlertId(),
        eventType: 4,
        riskLevel: 2,
        title: 'Alerta informativa',
        message: payload,
        location: 'Valle de Aburra',
        source: 'Backend',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        status: 'Active',
        instructions: ['Revise la informacion y mantengase atento a nuevas actualizaciones.'],
        channels: [3]
      }
    };
  }

  private createAlertId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `sim-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private clearAutoRemoveTimeouts(): void {
    this.autoRemoveTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.autoRemoveTimeouts.clear();
  }
}
