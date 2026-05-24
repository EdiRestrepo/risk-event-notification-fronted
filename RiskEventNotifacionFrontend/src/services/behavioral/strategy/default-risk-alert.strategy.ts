import type { RealTimeAlert } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { baseViewModelFields } from './alert-keywords.util';

/** Estrategia por defecto para alertas informativas no clasificadas. */
export class DefaultRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    return !!alert;
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      ...baseViewModelFields(alert),
      title: alert.content.title || 'Alerta informativa del sistema',
      iconClass: 'bi bi-info-circle-fill text-white',
      visualClass: 'risk-generic',
      riskLabel: 'GRIS - INFORMATIVA',
      priority: 'BAJA',
      requiresImmediateAction: false,
      recommendation: 'Revise la informacion y mantengase atento a nuevas actualizaciones oficiales.'
    };
  }
}
