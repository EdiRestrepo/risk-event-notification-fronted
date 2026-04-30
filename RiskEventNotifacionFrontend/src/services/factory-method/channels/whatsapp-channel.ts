import { NotificationChannel } from '../notification-channel.interface';

// Implementación para WhatsApp
export class WhatsAppChannel implements NotificationChannel {
  name = 'WhatsApp';
  private active = true;

  send(message: string, recipient: string): void {
    console.log(`💬 Enviando WhatsApp a ${recipient}: ${message}`);
    // Aquí iría la lógica para enviar WhatsApp via API (Twilio, etc)
  }

  isActive(): boolean {
    return this.active;
  }
}
