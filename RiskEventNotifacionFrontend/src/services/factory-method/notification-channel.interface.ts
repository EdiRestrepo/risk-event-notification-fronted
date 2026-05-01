// Interfaz para el canal de notificación
export interface NotificationChannel {
  name: string;
  send(message: string, recipient: string): void;
  isActive(): boolean;
}
