import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Importantes para directivas y rutas
  templateUrl: './dashboard.component.html'
  //styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // Estado para controlar si el menú lateral está extendido o no
  isSidebarVisible: boolean = true;
  
  // Datos del usuario logueado (puedes traerlos de un servicio)
  userName: string = 'Usuario SIATA';
  
  // Lista de opciones del menú para hacerlo dinámico
  menuOptions = [
    { label: 'Mapa de Riesgo', icon: 'map', path: '/dashboard/mapa' },
    { label: 'Alertas Recientes', icon: 'notifications', path: '/dashboard/alertas' },
    { label: 'Reportar Emergencia', icon: 'report_problem', path: '/dashboard/reportar' },
    { label: 'Configuración', icon: 'settings', path: '/dashboard/config' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí podrías validar si el token existe, si no, redirigir al login
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  // Alternar visibilidad del sidebar
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('token'); // Limpiar datos de sesión
    this.router.navigate(['/login']); // Redirigir al login
  }
}