import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserPreferencesService } from '../services/user-preferences.service';
import { NotificationService } from '../services/notification.service';

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

  // Estado de los canales de notificación
  channelPreferences: { sms: boolean; email: boolean; push: boolean; whatsapp: boolean } = {
    sms: true,
    email: true,
    push: true,
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
  ) {}

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
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userName = 'Usuario SIATA';
      }
    }

    // Cargar preferencias actuales del servicio
    const prefs = this.userPreferencesService.getPreferences();
    this.channelPreferences = { ...prefs.channels };

    // Iniciar conexión SignalR después del login
    this.notificationService.startConnection();
    this.notificationService.receiveNotifications();
  }

  ngOnDestroy(): void {
    this.notificationService.stopConnection();
  }

  toggleChannel(channel: 'sms' | 'email' | 'push' | 'whatsapp'): void {
    const newState = this.userPreferencesService.toggleChannel(channel);
    this.channelPreferences[channel] = newState;
  }

  savePreferences(): void {
    this.userPreferencesService.savePreferences();
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

