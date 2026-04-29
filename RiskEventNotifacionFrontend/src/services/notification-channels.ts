import { NotificationChannel } from './notification-channel.interface';

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

// Implementación para WhatsApp
export class WhatsAppChannel implements NotificationChannel {
  name = 'WhatsApp';
  private active = false;

  send(message: string, recipient: string): void {
    console.log(`💬 Enviando WhatsApp a ${recipient}: ${message}`);
    // Aquí iría la lógica para enviar WhatsApp via API (Twilio, etc)
  }

  isActive(): boolean {
    return this.active;
  }
}
