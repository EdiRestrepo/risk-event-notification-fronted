import type { RealTimeAlert } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields, messageContains } from './alert-keywords.util';

/** Estrategia para inundaciones, crecientes subitas y niveles de rio/quebradas. */
export class FloodRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    if (alert.content.eventType === 2) return true;
    if ([1, 3, 4, 5, 6].includes(alert.content.eventType)) return false;

    return messageContains(alert, ['inundacion', 'creciente', 'rio', 'quebrada', 'cauce', 'nivel del rio']);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Riesgo de inundacion o creciente subita',
      iconClass: 'bi bi-water text-white',
      visualClass: 'risk-flood',
      riskLabel: 'NARANJA - ALTO',
      priority: 'ALTA',
      requiresImmediateAction: true,
      recommendation: 'No cruce corrientes de agua. Muevase hacia zonas altas y reporte emergencias a las autoridades.'
    };
  }
}
