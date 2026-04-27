import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login.component';
import { DashboardComponent } from '../components/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }, // El componente con el menú
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
