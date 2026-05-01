import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserPreferencesService } from '../services/user-preferences.service';
import { NotificationService, RealTimeAlert } from '../services/notification.service';

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
    private notificationService: NotificationService
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
        const userId = user.id || user.userName;
        this.userPreferencesService.loadPreferences(userId).subscribe({
          next: (prefs) => {
            this.channelPreferences = { ...prefs.channels };
          },
          error: (err) => {
            console.error('Error al cargar preferencias desde el backend:', err);
          }
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userName = 'Usuario SIATA';
      }
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
    const newState = this.userPreferencesService.toggleChannel(channel);
    this.channelPreferences[channel] = newState;
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

  logout() {
    localStorage.removeItem('login_status');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}

