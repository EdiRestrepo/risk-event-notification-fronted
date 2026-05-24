import type { RealTimeAlert } from '../../models/risk-alert.model';
import { ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields, messageContains } from './alert-keywords.util';

/** Estrategia para huracanes, ciclones y vientos destructivos. */
export class HurricaneRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    if (alert.content.eventType === 6) return true;
    if ([1, 2, 3, 4, 5].includes(alert.content.eventType)) return false;

    return messageContains(alert, ['huracan', 'ciclon', 'tormenta tropical', 'vientos destructivos', 'vientos fuertes']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Alerta critica por huracan',
      iconClass: 'bi bi-tornado text-white',
      visualClass: 'risk-hurricane',
      riskLabel: 'ROJO - CRITICO',
      priority: 'CRITICA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS,
      recommendation: 'Permanezca bajo techo, alejese de ventanas y siga instrucciones oficiales de evacuacion.'
    };
  }
}
