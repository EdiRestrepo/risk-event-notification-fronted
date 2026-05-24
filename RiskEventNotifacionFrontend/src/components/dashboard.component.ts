import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay, timeout } from 'rxjs/operators';
import { AlertCenterFacadeService } from '../services/facade/alert-center.facade';
import type { RealTimeAlert } from '../services/models/risk-alert.model';
import { AlertPresentationViewModel } from '../services/behavioral/strategy/alert-presentation-strategy.interface';

interface BackendChannelView {
  code: number;
  key: 'sms' | 'email' | 'push' | 'whatsapp';
  label: string;
  iconClass: string;
  iconColor: string;
}

/**
 * DashboardComponent
 *
 * Componente principal que muestra el dashboard de alertas.
 *
 * PATRÓN FACADE:
 * - Depende únicamente de AlertCenterFacadeService.
 * - El Facade orquesta NotificationService, UserPreferencesService,
 *   AlertMessageBuilderService y las adaptaciones de patrones.
 *
 * PATRONES DE COMPORTAMIENTO EN LA VISTA:
 * - Observer: el componente se actualiza por observables del EventBus.
 * - Strategy: recibe un ViewModel ya clasificado por tipo de riesgo.
 * - Decorator: muestra el mensaje enriquecido de la misma alerta activa.
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

  /** Observable de alertas activas (se usa con async pipe en la vista). */
  realTimeAlerts$: Observable<RealTimeAlert[]>;

  /** Alertas transformadas por Strategy y enriquecidas por Decorator. */
  alertViewModels$: Observable<AlertPresentationViewModel[]>;

  /** Última alerta activa; sincroniza banner, tarjetas y canales del backend. */
  currentAlertView$: Observable<AlertPresentationViewModel | null>;

  /** Flag para saber si las preferencias ya se cargaron del backend. */
  preferencesLoaded = true;

  /** Estado visual heredado de preferencias de usuario. Se mantiene para no romper la fachada existente. */
  channelPreferences: { sms: boolean; email: boolean; push: boolean; whatsapp: boolean } = {
    sms: false,
    email: false,
    push: false,
    whatsapp: false
  };

  /** Códigos que llegan desde backend: 1 SMS, 2 Email, 3 Push/App, 4 WhatsApp. */
  readonly backendChannelOptions: BackendChannelView[] = [
    { code: 3, key: 'push', label: 'App Alerta Valle', iconClass: 'bi bi-phone-fill', iconColor: '#0066cc' },
    { code: 1, key: 'sms', label: 'SMS', iconClass: 'bi bi-chat-left-dots-fill', iconColor: '#25d366' },
    { code: 2, key: 'email', label: 'Correo Electrónico', iconClass: 'bi bi-envelope-fill', iconColor: '#ea4335' },
    { code: 4, key: 'whatsapp', label: 'WhatsApp', iconClass: 'bi bi-chat-bubble-fill', iconColor: '#0a7e5c' }
  ];

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
    this.realTimeAlerts$ = this.facade.alerts$;
    this.alertViewModels$ = this.facade.alertViewModels$.pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.currentAlertView$ = this.alertViewModels$.pipe(
      map(alertViews => alertViews.length > 0 ? alertViews[0] : null)
    );
  }

  ngOnInit(): void {
    const token = localStorage.getItem('login_status');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        this.userName = user.name || user.userName || 'Usuario SIATA';

        const userId = user.userName || user.name || user.id;
        console.log('Usuario completo desde localStorage:', user);
        console.log('Llamando al Facade con userId:', userId);

        this.facade.initializeAlertCenter(userId);

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
          }
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userName = 'Usuario SIATA';
      }
    }
  }

  ngOnDestroy(): void {
    // La fachada detiene la conexión cuando se cierra sesión.
  }

  removeAlert(alertId: string): void {
    this.facade.removeAlert(alertId);
  }

  toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void {
    this.channelPreferences[channel] = !this.channelPreferences[channel];
    this.facade.toggleChannel(channel);
  }

  savePreferences(): void {
    this.facade.savePreferences().subscribe({
      next: (response) => {
        console.log('Preferencias guardadas:', response.message);
        if (response.channels) {
          this.updateChannelPreferencesFromResponse(response);
        }
      },
      error: (err) => {
        console.error('Error al guardar preferencias:', err);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  sendCriticalRainAlert(): void {
    this.facade.sendCriticalRainAlert();
  }

  sendLandslideAlert(): void {
    this.facade.sendLandslideAlert();
  }

  sendFloodAlert(): void {
    this.facade.sendFloodAlert();
  }

  logout(): void {
    this.facade.logout();
    this.router.navigate(['/login']);
  }

  isBackendChannelActive(view: AlertPresentationViewModel | null, code: number): boolean {
    return Boolean(view?.channels?.includes(code));
  }

  getChannelStatus(view: AlertPresentationViewModel | null, code: number): string {
    return this.isBackendChannelActive(view, code) ? 'Activo por backend' : 'No incluido';
  }

  getRiskShortLabel(view: AlertPresentationViewModel | null): string {
    if (!view) return 'SIN ALERTA';
    return view.decoratorRiskLevel || view.riskLabel.split('-')[0].trim();
  }

  getAutoCloseSeconds(view: AlertPresentationViewModel | null): number {
    return view ? Math.round(view.autoCloseMilliseconds / 1000) : 0;
  }

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
