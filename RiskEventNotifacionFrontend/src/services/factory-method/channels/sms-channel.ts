import { NotificationChannel } from '../notification-channel.interface';

// Implementación para SMS
export class SMSChannel implements NotificationChannel {
  name = 'SMS';
  private active = true;

  send(message: string, recipient: string): void {
    console.log(`📱 Enviando SMS a ${recipient}: ${message}`);
    // Aquí iría la lógica para enviar SMS via API
  }

  isActive(): boolean {
    return this.active;
  }
}
