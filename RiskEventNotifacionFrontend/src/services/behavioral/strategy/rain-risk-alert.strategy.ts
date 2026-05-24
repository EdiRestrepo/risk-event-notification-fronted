import type { RealTimeAlert } from '../../notification.service';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { messageContains } from './alert-keywords.util';

/** Estrategia para lluvias intensas y fenomenos meteorologicos asociados. */
export class RainRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    return messageContains(alert, ['lluvia', 'lluvias', 'granizada', 'vientos']);
  }

  /** Método principal del patrón GoF Strategy */
  execute(alert: RealTimeAlert): AlertPresentationViewModel {
    return this.buildViewModel(alert);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      alert,
      title: 'Alerta por lluvias intensas',
      message: alert.message,
      riskLabel: 'NARANJA',
      iconClass: 'bi bi-cloud-rain-fill text-white',
      visualClass: 'risk-rain',
      recommendation: 'Evite zonas de ladera, quebradas y pasos deprimidos mientras persistan las lluvias.',
      priority: 'ALTA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: 25000
    };
  }
}
