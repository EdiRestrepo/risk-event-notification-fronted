import { Component, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { UserPreferencesService } from '../services/user-preferences.service';
import { NotificationService, RealTimeAlert, Notification } from '../services/notification.service';
import { AlertMessageBuilderService } from '../services/decorator/alert-message-builder.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  isSidebarVisible: boolean = true;
  userName: string = 'Usuario SIATA';

  /** Observable de alertas activas (se usa con async pipe en la vista) */
  realTimeAlerts$!: Observable<RealTimeAlert[]>;

  /** Flag para saber si las preferencias ya se cargaron del backend */
  preferencesLoaded = false;

  // Estado de los canales de notificación
  channelPreferences: { sms: boolean; email: boolean; push: boolean; whatsapp: boolean } = {
    sms: false,
    email: false,
    push: false,
    whatsapp: false
  };

  menuOptions = [
    { label: 'Mapa de Riesgo', icon: 'map', path: '/dashboard/mapa' },
    { label: 'Alertas Recientes', icon: 'notifications', path: '/dashboard/alertas' },
    { label: 'Reportar Emergencia', icon: 'report_problem', path: '/dashboard/reportar' },
    { label: 'Configuración', icon: 'settings', path: '/dashboard/config' }
  ];

  constructor(
    private router: Router,
    private userPreferencesService: UserPreferencesService,
    private notificationService: NotificationService,
    private alertMessageBuilder: AlertMessageBuilderService,
    private cdr: ChangeDetectorRef
  ) {
    this.realTimeAlerts$ = this.notificationService.alerts$;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('login_status');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener el nombre del usuario de localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        this.userName = user.name || user.userName || 'Usuario SIATA';

        // Cargar preferencias desde el backend usando el userId
        const userId = user.userName || user.name || user.id;

console.log('Usuario completo desde localStorage:', user);
console.log('Llamando a loadPreferences con userId:', userId);

this.userPreferencesService.loadPreferences(userId).pipe(
  timeout(8000)
).subscribe({
  next: (prefs) => {
    console.log('Preferencias mapeadas:', prefs);

     this.channelPreferences = {
    sms: prefs.channels.sms,
    email: prefs.channels.email,
    push: prefs.channels.push,
    whatsapp: prefs.channels.whatsapp
    };

    console.log('channelPreferences final:', this.channelPreferences);

  this.preferencesLoaded = true;
  this.cdr.detectChanges();
  },
  error: (err) => {
    console.error('Error al cargar preferencias:', err);
    this.preferencesLoaded = true;
  }
});
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userName = 'Usuario SIATA';
        this.preferencesLoaded = true;
      }
    } else {
      // No hay usuario en localStorage, habilitar toggles con valores por defecto
      this.preferencesLoaded = true;
    }

    // Iniciar conexión SignalR después del login
    this.notificationService.startConnection();
    this.notificationService.receiveNotifications();
  }

  ngOnDestroy(): void {
    this.notificationService.stopConnection();
  }

  removeAlert(alertId: string): void {
    this.notificationService.removeAlert(alertId);
  }

  toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void {
    // Primero actualizar estado local
    this.channelPreferences[channel] = !this.channelPreferences[channel];
    // Sincronizar con el servicio
    if (this.channelPreferences[channel]) {
      this.userPreferencesService.enableChannel(channel);
    } else {
      this.userPreferencesService.disableChannel(channel);
    }
  }

  savePreferences(): void {
    this.userPreferencesService.savePreferences().subscribe({
      next: (response) => {
        console.log('Preferencias guardadas:', response.message);
        // Actualizar la vista con lo que devolvió el backend
        if (response.channels) {
          this.channelPreferences = {
            sms: response.channels.sms === true,
            email: response.channels.email === true,
            push: response.channels.push === true,
            whatsapp: response.channels.whatsapp === true
          };
        }
      },
      error: (err) => {
        console.error('Error al guardar preferencias:', err);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  /**
   * Envía una alerta de lluvia intensa enriquecida con el patrón Decorator
   * Demuestra cómo los decoradores agilizan progresivamente el mensaje
   */
  sendCriticalRainAlert(): void {
    // Obtener los canales activos del usuario
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    // Construir la alerta enriquecida con decoradores
    const decoratedMessage = this.alertMessageBuilder.buildCriticalRainAlert();

    // Enviar la notificación a través de los canales activos
    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    const responses = this.notificationService.sendNotification(notification);
    console.log('Respuestas de envío:', responses);
  }

  /**
   * Envía una alerta de riesgo de deslizamiento enriquecida con el patrón Decorator
   */
  sendLandslideAlert(): void {
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    const decoratedMessage = this.alertMessageBuilder.buildLandslideAlert();

    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    const responses = this.notificationService.sendNotification(notification);
    console.log('Respuestas de envío:', responses);
  }

  /**
   * Envía una alerta de inundación enriquecida con el patrón Decorator
   */
  sendFloodAlert(): void {
    const activeChannels = this.getActiveChannels();
    if (activeChannels.length === 0) {
      alert('Por favor, activa al menos un canal de notificación.');
      return;
    }

    const decoratedMessage = this.alertMessageBuilder.buildFloodAlert();

    const notification: Notification = {
      title: decoratedMessage.getTitle(),
      message: decoratedMessage.getBody(),
      recipient: this.getUserId(),
      channels: activeChannels
    };

    const responses = this.notificationService.sendNotification(notification);
    console.log('Respuestas de envío:', responses);
  }

  /**
   * Obtiene la lista de canales activos según las preferencias del usuario
   */
  private getActiveChannels(): string[] {
    const channels: string[] = [];
    if (this.channelPreferences.sms) channels.push('sms');
    if (this.channelPreferences.email) channels.push('email');
    if (this.channelPreferences.push) channels.push('push');
    if (this.channelPreferences.whatsapp) channels.push('whatsapp');
    return channels;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  private getUserId(): string {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.userName || user.name || user.id || 'usuario-demo';
      } catch (e) {
        return 'usuario-demo';
      }
    }
    return 'usuario-demo';
  }

  logout() {
    localStorage.removeItem('login_status');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}

