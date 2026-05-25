import type { RealTimeAlert } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields, messageContains } from './alert-keywords.util';

/** Estrategia para lluvias intensas y fenomenos meteorologicos asociados. */
export class RainRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    if (alert.content.eventType === 1) return true;
    if ([2, 3, 4, 5, 6].includes(alert.content.eventType)) return false;

    return messageContains(alert, ['lluvia', 'lluvias', 'granizada']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Alerta por lluvias intensas',
      iconClass: 'bi bi-cloud-rain-fill text-white',
      visualClass: 'risk-rain',
      riskLabel: 'NARANJA - ALTO',
      priority: 'ALTA',
      requiresImmediateAction: true,
      recommendation: 'Evite zonas de ladera, quebradas y pasos deprimidos mientras persistan las lluvias.'
    };
  }
}
