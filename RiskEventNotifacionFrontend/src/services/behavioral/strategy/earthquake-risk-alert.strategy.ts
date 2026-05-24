import type { RealTimeAlert } from '../../models/risk-alert.model';
import { ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields, messageContains } from './alert-keywords.util';

/** Estrategia para terremotos, sismos y movimientos teluricos. */
export class EarthquakeRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    if (alert.content.eventType === 5) return true;
    if ([1, 2, 3, 4, 6].includes(alert.content.eventType)) return false;

    return messageContains(alert, ['terremoto', 'sismo', 'temblor', 'movimiento telurico', 'movimiento en masa sismica']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Alerta critica por terremoto',
      iconClass: 'bi bi-exclamation-diamond-fill text-white',
      visualClass: 'risk-earthquake',
      riskLabel: 'ROJO - CRITICO',
      priority: 'CRITICA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS,
      recommendation: 'Agachese, cubrase y sujetese. Alejese de ventanas y evacue solo cuando sea seguro.'
    };
  }
}
