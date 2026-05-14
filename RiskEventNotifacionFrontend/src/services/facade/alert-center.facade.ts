import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { NotificationService, RealTimeAlert, Notification } from '../notification.service';
import { UserPreferencesService } from '../user-preferences.service';
import { AlertMessageBuilderService } from '../decorator/alert-message-builder.service';

/**
 * AlertCenterFacadeService - Patrón FACADE
 *
 * Propósito:
 * - Punto único de acceso para que DashboardComponent interactúe con servicios de alertas
 * - Simplifica la coordinación entre NotificationService, UserPreferencesService, AuthService y AlertMessageBuilderService
 * - NO modifica ni duplica la lógica existente de Factory Method y Decorator
 *
 * Responsabilidades:
 * - Orquestar llamadas a servicios
 * - Manejar flujo de autenticación y preferencias
 * - Delegar construcción de mensajes enriquecidos al AlertMessageBuilderService (Decorator)
 * - Delegar envío de notificaciones al NotificationService (Factory Method)
 *
 * Patrón Facade (GoF):
 * - Cliente: DashboardComponent
 * - Fachada: AlertCenterFacadeService
 * - Subsistemas: NotificationService, UserPreferencesService, AlertMessageBuilderService, AuthService
 */
@Injectable({ providedIn: 'root' })
export class AlertCenterFacadeService {

  /** Observable de alertas en tiempo real (desde NotificationService, SIN MODIFICAR) */
  get alerts$(): Observable<RealTimeAlert[]> {
    return this.notificationService.alerts$;
  }

  constructor(
    private notificationService: NotificationService,
    private userPreferencesService: UserPreferencesService,
    private alertMessageBuilder: AlertMessageBuilderService,
    private router: Router
  ) {}

  /**
   * Inicializar el centro de alertas
   * Equivalente a: ngOnInit() del componente original
   */
  initializeAlertCenter(userId: string): void {
    // Cargar preferencias del usuario
    this.userPreferencesService.loadPreferences(userId).subscribe({
      next: (prefs) => {
        console.log('Preferencias cargadas en Facade:', prefs);
      },
      error: (err) => {
        console.error('Error cargando preferencias en Facade:', err);
      }
    });

    // Iniciar conexión SignalR
    this.notificationService.startConnection();
    this.notificationService.receiveNotifications();
  }

  /**
   * Obtener canales activos del usuario (como array de strings)
   */
  getActiveChannels(): string[] {
    return this.userPreferencesService.getActiveChannelNames();
  }

  /**
   * Alternar un canal de notificación
   * @param channel - Canal a alternar: 'sms' | 'email' | 'push' | 'whatsapp'
   */
  toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void {
    if (this.userPreferencesService.isChannelEnabled(channel)) {
      this.userPreferencesService.disableChannel(channel);
    } else {
      this.userPreferencesService.enableChannel(channel);
    }
  }

  /**
   * Guardar preferencias del usuario
   */
  savePreferences(): Observable<any> {
    return this.userPreferencesService.savePreferences();
  }

  /**
   * Enviar alerta de lluvia intensa
   * Coordina: Builder (Decorator) → NotificationService (Factory Method)
   */
  sendCriticalRainAlert(): void {
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    // Delegar construcción de mensaje al AlertMessageBuilderService (Decorator pattern)
    const decoratedMessage = this.alertMessageBuilder.buildCriticalRainAlert();

    // Crear notificación
    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    // Delegar envío al NotificationService (Factory Method pattern)
    const responses = this.notificationService.sendNotification(notification);
    console.log('Alerta de lluvia enviada:', responses);
  }

  /**
   * Enviar alerta de deslizamiento
   * Coordina: Builder (Decorator) → NotificationService (Factory Method)
   */
  sendLandslideAlert(): void {
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    // Delegar construcción de mensaje al AlertMessageBuilderService (Decorator pattern)
    const decoratedMessage = this.alertMessageBuilder.buildLandslideAlert();

    // Crear notificación
    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    // Delegar envío al NotificationService (Factory Method pattern)
    const responses = this.notificationService.sendNotification(notification);
    console.log('Alerta de deslizamiento enviada:', responses);
  }

  /**
   * Enviar alerta de inundación
   * Coordina: Builder (Decorator) → NotificationService (Factory Method)
   */
  sendFloodAlert(): void {
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    // Delegar construcción de mensaje al AlertMessageBuilderService (Decorator pattern)
    const decoratedMessage = this.alertMessageBuilder.buildFloodAlert();

    // Crear notificación
    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    // Delegar envío al NotificationService (Factory Method pattern)
    const responses = this.notificationService.sendNotification(notification);
    console.log('Alerta de inundación enviada:', responses);
  }

  /**
   * Remover una alerta de la vista
   */
  removeAlert(alertId: string): void {
    this.notificationService.removeAlert(alertId);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.notificationService.stopConnection();
    // Limpiar datos de sesión
    localStorage.removeItem('login_status');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  /**
   * Obtener el ID del usuario actual desde localStorage
   */
  private getUserId(): string {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.userName || user.name || user.id || 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }
}
