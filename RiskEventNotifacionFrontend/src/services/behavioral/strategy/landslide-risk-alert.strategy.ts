import type { RealTimeAlert } from '../../models/risk-alert.model';
import { ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields, messageContains } from './alert-keywords.util';

/** Estrategia para alertas de deslizamiento y saturacion de suelos. */
export class LandslideRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    if (alert.content.eventType === 3) return true;
    if ([1, 2, 4, 5, 6].includes(alert.content.eventType)) return false;

    return messageContains(alert, ['deslizamiento', 'ladera', 'saturacion', 'suelos', 'talud']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Riesgo de deslizamiento',
      iconClass: 'bi bi-exclamation-octagon-fill text-white',
      visualClass: 'risk-landslide',
      riskLabel: 'ROJO - CRITICO',
      priority: 'CRITICA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: ALERT_CRITICAL_AUTO_CLOSE_MILLISECONDS,
      recommendation: 'Alejese de taludes y viviendas en ladera. Atienda instrucciones de organismos de emergencia.'
    };
  }
}
