import type { RealTimeAlert } from '../../notification.service';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { messageContains } from './alert-keywords.util';

/** Estrategia para alertas de deslizamiento y saturacion de suelos. */
export class LandslideRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    return messageContains(alert, ['deslizamiento', 'ladera', 'saturacion', 'suelos', 'talud']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      alert,
      title: 'Riesgo de deslizamiento',
      message: alert.message,
      riskLabel: 'ROJO',
      iconClass: 'bi bi-exclamation-octagon-fill text-white',
      visualClass: 'risk-landslide',
      recommendation: 'Aléjese de taludes y viviendas en ladera. Atienda instrucciones de organismos de emergencia.',
      priority: 'CRITICA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: 35000
    };
  }
}
