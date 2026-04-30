import { NotificationChannel } from '../notification-channel.interface';

// Implementación para Email
export class EmailChannel implements NotificationChannel {
  name = 'Email';
  private active = true;

  send(message: string, recipient: string): void {
    console.log(`📧 Enviando Email a ${recipient}: ${message}`);
    // Aquí iría la lógica para enviar Email via API
  }

  isActive(): boolean {
    return this.active;
  }
}
