import { Component, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AlertCenterFacadeService } from '../services/facade/alert-center.facade';
import { RealTimeAlert } from '../services/notification.service';
import { AlertPresentationViewModel } from '../services/behavioral/strategy/alert-presentation-strategy.interface';

/**
 * DashboardComponent
 *
 * Componente principal que muestra el dashboard de alertas.
 *
 * PATRÓN FACADE:
 * - Depende ÚNICAMENTE de AlertCenterFacadeService (punto único de acceso)
 * - El Facade orquesta: NotificationService, UserPreferencesService, AuthService, AlertMessageBuilderService
 * - El componente NO conoce directamente los servicios internos
 *
 * Responsabilidades del componente:
 * - Renderizar la interfaz gráfica (SIN CAMBIOS)
 * - Manejar eventos de usuario
 * - Delegardelegación en el Facade
 *
 * La lógica de alertas, preferencias y envío permanece INTACTA
 */
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
  realTimeAlerts$: Observable<RealTimeAlert[]>;

  /** Alertas transformadas por Strategy para la presentacion en pantalla */
  alertViewModels$: Observable<AlertPresentationViewModel[]>;

  /** Flag para saber si las preferencias ya se cargaron del backend */
  preferencesLoaded = true; // Inicializar como true para permitir interacción inmediata

  // Estado de los canales de notificación (mantiene la interfaz gráfica sin cambios)
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
    private facade: AlertCenterFacadeService,
    private cdr: ChangeDetectorRef
  ) {
    // Obtener observables de alertas desde el Facade
    this.realTimeAlerts$ = this.facade.alerts$;
    this.alertViewModels$ = this.facade.alertViewModels$;
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

        // Inicializar el centro de alertas a través del Facade
        const userId = user.userName || user.name || user.id;
        console.log('Usuario completo desde localStorage:', user);
        console.log('Llamando al Facade con userId:', userId);

        // El Facade maneja:
        // - Cargar preferencias del usuario
        // - Iniciar conexión SignalR
        // - Configurar los canales activos
        this.facade.initializeAlertCenter(userId);

        // Cargar preferencias para actualizar el estado local visual
        // Permitir que la UI sea interactiva mientras se cargan las preferencias
        this.facade.savePreferences().pipe(
          timeout(8000)
        ).subscribe({
          next: (response) => {
            console.log('Preferencias cargadas desde Facade:', response);
            this.updateChannelPreferencesFromResponse(response);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar preferencias:', err);
            // Las preferencias siguen siendo accesibles incluso si hay error
          }
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userName = 'Usuario SIATA';
      }
    }
  }

  ngOnDestroy(): void {
    // El Facade maneja la limpieza (stopConnection)
  }

  removeAlert(alertId: string): void {
    this.facade.removeAlert(alertId);
  }

  toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void {
    // Actualizar estado local (para la UI)
    this.channelPreferences[channel] = !this.channelPreferences[channel];

    // Delegar en el Facade (que a su vez delega en UserPreferencesService)
    this.facade.toggleChannel(channel);
  }

  savePreferences(): void {
    this.facade.savePreferences().subscribe({
      next: (response) => {
        console.log('Preferencias guardadas:', response.message);
        // Actualizar la vista con lo que devolvió el backend
        if (response.channels) {
          this.updateChannelPreferencesFromResponse(response);
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
   * Envía una alerta de lluvia intensa
   * El Facade orquesta: AlertMessageBuilderService (Decorator) → NotificationService (Factory Method)
   */
  sendCriticalRainAlert(): void {
    this.facade.sendCriticalRainAlert();
  }

  /**
   * Envía una alerta de riesgo de deslizamiento
   */
  sendLandslideAlert(): void {
    this.facade.sendLandslideAlert();
  }

  /**
   * Envía una alerta de inundación
   */
  sendFloodAlert(): void {
    this.facade.sendFloodAlert();
  }

  logout(): void {
    this.facade.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Actualiza el estado local visual de las preferencias desde la respuesta del backend
   */
  private updateChannelPreferencesFromResponse(response: any): void {
    if (response.channels) {
      this.channelPreferences = {
        sms: response.channels.sms === true,
        email: response.channels.email === true,
        push: response.channels.push === true,
        whatsapp: response.channels.whatsapp === true
      };
    }
  }
}
