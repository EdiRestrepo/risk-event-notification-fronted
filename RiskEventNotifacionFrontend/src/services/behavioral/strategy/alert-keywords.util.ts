import type { RealTimeAlert } from '../../models/risk-alert.model';
import { ALERT_AUTO_CLOSE_MILLISECONDS } from '../../models/risk-alert.model';
import type { AlertPriority } from './alert-presentation-strategy.interface';

export function normalizedAlertText(alert: RealTimeAlert): string {
  return [
    alert.title,
    alert.content.title,
    alert.content.message,
    alert.content.location,
    alert.content.source,
    ...alert.content.instructions
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function messageContains(alert: RealTimeAlert, keywords: string[]): boolean {
  const message = normalizedAlertText(alert);
  return keywords.some(keyword => message.includes(keyword));
}

export function riskLabelFromLevel(riskLevel: number): string {
  switch (riskLevel) {
    case 1:
      return 'VERDE - BAJO';
    case 2:
      return 'AMARILLO - MEDIO';
    case 3:
      return 'NARANJA - ALTO';
    case 4:
      return 'ROJO - CRITICO';
    default:
      return 'INFORMATIVA';
  }
}

export function priorityFromRiskLevel(riskLevel: number): AlertPriority {
  if (riskLevel >= 4) return 'CRITICA';
  if (riskLevel === 3) return 'ALTA';
  if (riskLevel === 2) return 'MEDIA';
  return 'BAJA';
}

export function requiresImmediateAction(riskLevel: number): boolean {
  return riskLevel >= 3;
}

export function baseViewModelFields(alert: RealTimeAlert) {
  return {
    alert,
    alertId: alert.content.id,
    message: alert.content.message,
    location: alert.content.location,
    source: alert.content.source,
    receivedAt: alert.receivedAt,
    createdAt: alert.content.createdAt,
    expiresAt: alert.content.expiresAt,
    instructions: alert.content.instructions,
    channels: alert.content.channels,
    riskLabel: riskLabelFromLevel(alert.content.riskLevel),
    priority: priorityFromRiskLevel(alert.content.riskLevel),
    requiresImmediateAction: requiresImmediateAction(alert.content.riskLevel),
    autoCloseMilliseconds: ALERT_AUTO_CLOSE_MILLISECONDS,
    simulated: alert.simulated
  };
}
