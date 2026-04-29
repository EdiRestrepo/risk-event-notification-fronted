import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

interface User {
  userName: string;
  password: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Base de datos local de usuarios (para demostración)
  private users: User[] = [
    { userName: 'carolina', password: '1234', displayName: 'Carolina Gómez' },
    { userName: 'admin', password: 'admin', displayName: 'Administrador' },
    { userName: 'usuario', password: '123456', displayName: 'Usuario Demo' }
  ];

  private apiUrl = 'https://localhost:44357/api/auth/login'; // Para cuando tengas backend

  constructor(private http: HttpClient) {}

  /**
   * Login local sin backend (para desarrollo)
   * Usa validación local de usuarios pre-configurados
   */
  login(credentials: any): Observable<any> {
    // Buscar el usuario en la lista local
    const user = this.users.find(
      u => u.userName === credentials.userName && u.password === credentials.password
    );

    // Simular delay de red para que se vea más realista
    if (user) {
      return of({
        success: true,
        message: `Bienvenido ${user.displayName}`,
        token: 'mock-token-' + Date.now(),
        user: {
          id: user.userName,
          name: user.displayName,
          userName: user.userName
        }
      }).pipe(delay(500)); // Simula 500ms de respuesta del servidor
    } else {
      // Usuario no encontrado
      return throwError(() => new Error('Credenciales inválidas')).pipe(delay(500));
    }
  }

  /**
   * Login remoto contra el API backend real
   * Descomenta este método y úsalo cuando tengas el backend corriendo
   */
  loginRemote(credentials: any): Observable<any> {
    return this.http.post(this.apiUrl, credentials, {
      responseType: 'text'
    }).pipe(
      map(response => ({
        success: true,
        message: response,
        token: 'token-from-backend',
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
   * Agrega un nuevo usuario a la base de datos local
   * Útil para registros en desarrollo
   */
  addUser(userName: string, password: string, displayName: string): void {
    const userExists = this.users.some(u => u.userName === userName);
    if (!userExists) {
      this.users.push({ userName, password, displayName });
    }
  }

  /**
   * Obtiene la lista de usuarios disponibles (solo para desarrollo)
   */
  getAvailableUsers(): User[] {
    return [...this.users];
  }

  /**
   * Verifica si un usuario existe
   */
  userExists(userName: string): boolean {
    return this.users.some(u => u.userName === userName);
  }
}
