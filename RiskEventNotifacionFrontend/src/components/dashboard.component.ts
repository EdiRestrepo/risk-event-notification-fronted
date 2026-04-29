import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  isSidebarVisible: boolean = true;
  userName: string = 'Usuario SIATA';

  menuOptions = [
    { label: 'Mapa de Riesgo', icon: 'map', path: '/dashboard/mapa' },
    { label: 'Alertas Recientes', icon: 'notifications', path: '/dashboard/alertas' },
    { label: 'Reportar Emergencia', icon: 'report_problem', path: '/dashboard/reportar' },
    { label: 'Configuración', icon: 'settings', path: '/dashboard/config' }
  ];

  constructor(private router: Router) {}

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

