import type { RealTimeAlert } from '../../notification.service';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';

/** Estrategia por defecto para alertas informativas no clasificadas. */
export class DefaultRiskAlertStrategy implements AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean {
    return !!alert;
  }

  /** Método principal del patrón GoF Strategy */
  execute(alert: RealTimeAlert): AlertPresentationViewModel {
    return this.buildViewModel(alert);
  }

  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel {
    return {
      alert,
      title: 'Alerta informativa del sistema',
      message: alert.message,
      riskLabel: 'INFORMATIVA',
      iconClass: 'bi bi-info-circle-fill text-white',
      visualClass: 'risk-info',
      recommendation: 'Revise la información y manténgase atento a nuevas actualizaciones oficiales.',
      priority: 'MEDIA',
      requiresImmediateAction: false,
      autoCloseMilliseconds: 20000
    };
  }
}
