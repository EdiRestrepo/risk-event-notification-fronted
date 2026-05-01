import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { NotificationChannel } from './factory-method/notification-channel.interface';
import { NotificationChannelCreator } from './factory-method/notification-channel-creator';
import { SMSChannelCreator } from './factory-method/creators/sms-channel-creator';
import { EmailChannelCreator } from './factory-method/creators/email-channel-creator';
import { PushChannelCreator } from './factory-method/creators/push-channel-creator';
import { WhatsAppChannelCreator } from './factory-method/creators/whatsapp-channel-creator';

/**
 * Modelo para las preferencias de notificación del usuario
 */
export interface UserNotificationPreferences {
  userId: string;
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  activeChannels: NotificationChannel[];
}

/**
 * Respuesta del backend al guardar preferencias
 */
export interface SavePreferencesResponse {
  success: boolean;
  message: string;
  userId: string;
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
}

/**
 * Servicio para gestionar las preferencias de notificación del usuario
 * Utiliza directamente los ConcreteCreators del patrón Factory Method (GoF)
 * Se integra con el backend para persistir preferencias
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {

  private apiUrl = 'https://localhost:44357/api/channels';
  private apiUrlPreferences = 'preferences';
  private apiUrlSavePreferences = 'savepreferences';

  /** Registro de ConcreteCreators — el cliente trabaja con el tipo abstracto Creator */
  private creators = new Map<string, NotificationChannelCreator>([
    ['sms', new SMSChannelCreator()],
    ['email', new EmailChannelCreator()],
    ['push', new PushChannelCreator()],
    ['whatsapp', new WhatsAppChannelCreator()],
  ]);

  private userPreferences: UserNotificationPreferences = {
    userId: '',
    channels: {
      sms: false,
      email: false,
      push: false,
      whatsapp: false
    },
    activeChannels: []
  };

  constructor(private http: HttpClient) {}

  /**
   * Inicializa los canales activos basados en las preferencias del usuario
   */
  private initializeChannels(): void {
    const activeChannelNames: string[] = [];

    if (this.userPreferences.channels.sms) activeChannelNames.push('sms');
    if (this.userPreferences.channels.email) activeChannelNames.push('email');
    if (this.userPreferences.channels.push) activeChannelNames.push('push');
    if (this.userPreferences.channels.whatsapp) activeChannelNames.push('whatsapp');

    // Cada ConcreteCreator crea su ConcreteProduct vía el factory method
    this.userPreferences.activeChannels = activeChannelNames.map(name => {
      const creator = this.creators.get(name);
      if (!creator) throw new Error(`Canal no soportado: ${name}`);
      return creator.createChannel();
    });
  }

  /**
   * Consulta las preferencias del usuario desde el backend
   * GET /api/preferences/{userId}
   * Si es la primera vez, el backend retorna todos los canales en false
   */
  loadPreferences(userId: string): Observable<UserNotificationPreferences> {
    return this.http.get<any>(
      `${this.apiUrl}/${this.apiUrlPreferences}/${userId}`
    ).pipe(
      map(response => {
        console.log('Respuesta cruda del backend (preferencias):', JSON.stringify(response));

        let channels = { sms: false, email: false, push: false, whatsapp: false };

        if (Array.isArray(response)) {
          // Si el backend devuelve un array de canales: [{channelName: "sms", active: true}, ...]
          response.forEach((item: any) => {
            const name = (item.channelName || item.name || item.channel || '').toLowerCase();
            const active = item.active === true || item.isActive === true || item.enabled === true;
            if (name in channels) {
              (channels as any)[name] = active;
            }
          });
        } else if (response && response.channels) {
          // Si viene como { channels: { sms: true, ... } }
          channels = {
            sms: response.channels.sms === true,
            email: response.channels.email === true,
            push: response.channels.push === true,
            whatsapp: response.channels.whatsapp === true
          };
        } else if (response && typeof response === 'object') {
          // Si viene como objeto plano { sms: true, email: false, ... }
          channels = {
            sms: response.sms === true,
            email: response.email === true,
            push: response.push === true,
            whatsapp: response.whatsapp === true
          };
        }

        this.userPreferences = {
          userId: response?.userId || userId,
          channels,
          activeChannels: []
        };
        this.initializeChannels();
        return this.userPreferences;
      }),
      catchError(error => {
        console.error('Error al cargar preferencias:', error);
        // Si falla, inicializar con valores por defecto (todo en false)
        this.userPreferences = {
          userId,
          channels: { sms: false, email: false, push: false, whatsapp: false },
          activeChannels: []
        };
        return throwError(() => new Error('No se pudieron cargar las preferencias'));
      })
    );
  }

  /**
   * Guarda las preferencias del usuario en el backend
   * PUT /api/preferences/{userId}
   */
  savePreferences(): Observable<SavePreferencesResponse> {
    const userId = this.userPreferences.userId;
    const body = {
      channels: { ...this.userPreferences.channels }
    };

    return this.http.put<SavePreferencesResponse>(
      `${this.apiUrl}/${this.apiUrlSavePreferences}/${userId}`, body
    ).pipe(
      tap(response => {
        console.log('Preferencias guardadas exitosamente:', response);
        // Actualizar canales activos después de guardar
        this.initializeChannels();
      }),
      catchError(error => {
        console.error('Error al guardar preferencias:', error);
        return throwError(() => new Error('No se pudieron guardar las preferencias'));
      })
    );
  }

  /**
   * Obtiene las preferencias del usuario (estado local)
   */
  getPreferences(): UserNotificationPreferences {
    return this.userPreferences;
  }

  /**
   * Actualiza las preferencias del usuario localmente
   * @param preferences - Nuevas preferencias a aplicar
   */
  updatePreferences(preferences: Partial<UserNotificationPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.initializeChannels();
  }

  /**
   * Habilita un canal específico
   * @param channelName - Nombre del canal a habilitar
   */
  enableChannel(channelName: keyof typeof this.userPreferences.channels): void {
    this.userPreferences.channels[channelName] = true;
    this.initializeChannels();
  }

  /**
   * Deshabilita un canal específico
   * @param channelName - Nombre del canal a deshabilitar
   */
  disableChannel(channelName: keyof typeof this.userPreferences.channels): void {
    this.userPreferences.channels[channelName] = false;
    this.initializeChannels();
  }

  /**
   * Envía una notificación a través de todos los canales activos
   * @param message - Mensaje a enviar
   * @param recipient - Destinatario de la notificación
   */
  sendNotification(message: string, recipient: string): void {
    this.userPreferences.activeChannels.forEach(channel => {
      if (channel.isActive()) {
        channel.send(message, recipient);
      }
    });
  }

  /**
   * Alterna el estado de un canal y devuelve el nuevo estado
   */
  toggleChannel(channelName: keyof typeof this.userPreferences.channels): boolean {
    this.userPreferences.channels[channelName] = !this.userPreferences.channels[channelName];
    this.initializeChannels();
    return this.userPreferences.channels[channelName];
  }

  /**
   * Obtiene los canales activos del usuario
   */
  getActiveChannels(): NotificationChannel[] {
    return this.userPreferences.activeChannels;
  }

  /**
   * Obtiene información sobre los canales disponibles
   */
  getChannelsInfo() {
    return {
      sms: {
        name: 'SMS',
        icon: 'bi-chat-left-dots-fill',
        color: '#25d366',
        active: this.userPreferences.channels.sms
      },
      email: {
        name: 'Correo Electrónico',
        icon: 'bi-envelope-fill',
        color: '#ea4335',
        active: this.userPreferences.channels.email
      },
      push: {
        name: 'App Alerta Valle',
        icon: 'bi-phone-fill',
        color: '#0066cc',
        active: this.userPreferences.channels.push
      },
      whatsapp: {
        name: 'WhatsApp',
        icon: 'bi-chat-bubble-fill',
        color: '#0a7e5c',
        active: this.userPreferences.channels.whatsapp
      }
    };
  }
}
