import { NotificationChannel } from '../notification-channel.interface';

// Implementación para Push Notifications (App)
export class PushChannel implements NotificationChannel {
  name = 'App Alerta Valle';
  private active = true;

  send(message: string, recipient: string): void {
    console.log(`🔔 Enviando Push Notification a ${recipient}: ${message}`);
    // Aquí iría la lógica para enviar Push Notifications via API
  }

  isActive(): boolean {
    return this.active;
  }
}
