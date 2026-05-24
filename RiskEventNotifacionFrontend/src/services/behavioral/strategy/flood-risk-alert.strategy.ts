import type { RealTimeAlert } from '../../notification.service';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { messageContains } from './alert-keywords.util';

/** Estrategia para inundaciones, crecientes subitas y niveles de rio/quebradas. */
export class FloodRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    return messageContains(alert, ['inundacion', 'creciente', 'rio', 'quebrada', 'cauce', 'nivel del rio']);
  }

  /** Método principal del patrón GoF Strategy */
  execute(alert: RealTimeAlert): AlertPresentationViewModel {
    return this.buildViewModel(alert);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      alert,
      title: 'Riesgo de inundación o creciente súbita',
      message: alert.message,
      riskLabel: 'NARANJA',
      iconClass: 'bi bi-water text-white',
      visualClass: 'risk-flood',
      recommendation: 'No cruce corrientes de agua. Muévase hacia zonas altas y reporte emergencias a las autoridades.',
      priority: 'ALTA',
      requiresImmediateAction: true,
      autoCloseMilliseconds: 30000
    };
  }
}
