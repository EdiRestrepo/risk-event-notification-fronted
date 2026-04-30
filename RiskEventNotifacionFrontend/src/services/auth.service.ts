import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://localhost:44357/api/auth/login';

  constructor(private http: HttpClient) {}

  /**
   * Autentica al usuario contra el backend real
   * POST /api/auth/login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<{ success: boolean }>(this.apiUrl, credentials).pipe(
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
        console.error('Error de autenticación:', error);
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
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
