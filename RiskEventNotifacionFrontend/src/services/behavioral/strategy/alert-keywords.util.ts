import type { RealTimeAlert } from '../../notification.service';

export function normalizedMessage(alert: RealTimeAlert): string {
  return alert.message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function messageContains(alert: RealTimeAlert, keywords: string[]): boolean {
  const message = normalizedMessage(alert);
  return keywords.some(keyword => message.includes(keyword));
}
