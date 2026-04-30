import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    userName: string;
  };
}

interface DemoUser {
  userName: string;
  password: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://localhost:44357/api/auth/login';

  // Usuarios demo para fallback cuando el backend no está disponible
  private demoUsers: DemoUser[] = [
    { userName: 'carolina', password: '1234', displayName: 'Carolina Gómez' },
    { userName: 'admin', password: 'admin', displayName: 'Administrador' },
    { userName: 'usuario', password: '123456', displayName: 'Usuario Demo' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Login con fallback: primero intenta contra el backend,
   * si no responde, valida con usuarios demo locales.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<{ success: boolean }>(this.apiUrl, credentials).pipe(
      timeout(5000), // Espera máximo 5 segundos por respuesta del backend
      map(response => ({
        success: response.success,
        message: `Bienvenido ${credentials.userName}`,
        token: 'session-token-' + Date.now(),
        user: {
          id: credentials.userName,
          name: credentials.userName,
          userName: credentials.userName
        }
      })),
      catchError(error => {
        console.warn('Backend no disponible, intentando login local...', error.message);
        return this.loginLocal(credentials);
      })
    );
  }

  /**
   * Login local con usuarios demo (fallback)
   */
  private loginLocal(credentials: LoginRequest): Observable<LoginResponse> {
    const user = this.demoUsers.find(
      u => u.userName === credentials.userName && u.password === credentials.password
    );

    if (user) {
      return of({
        success: true,
        message: `Bienvenido ${user.displayName} (modo offline)`,
        token: 'local-token-' + Date.now(),
        user: {
          id: user.userName,
          name: user.displayName,
          userName: user.userName
        }
      });
    }

    return throwError(() => new Error('Credenciales inválidas'));
  }

  /**
   * Obtiene los usuarios demo disponibles (para mostrar en pantalla de login)
   */
  getDemoUsers(): { userName: string; password: string }[] {
    return this.demoUsers.map(u => ({ userName: u.userName, password: u.password }));
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): { id: string; name: string; userName: string } | null {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        return JSON.parse(currentUser);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return localStorage.getItem('login_status') === 'success';
  }
}
