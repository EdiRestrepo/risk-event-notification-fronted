import type { RealTimeAlert } from '../../notification.service';

export type AlertPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

/**
 * Resultado de aplicar una estrategia de presentacion a una alerta SIATA.
 * El componente solo pinta este ViewModel; no decide reglas de negocio.
 */
export interface AlertPresentationViewModel {
  alert: RealTimeAlert;
  title: string;
  message: string;
  riskLabel: string;
  iconClass: string;
  visualClass: string;
  recommendation: string;
  priority: AlertPriority;
  requiresImmediateAction: boolean;
  autoCloseMilliseconds: number;
}

/**
 * Strategy del dominio: cada tipo de riesgo define su propia forma de
 * comunicarse visualmente al ciudadano.
 */
export interface AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean;
  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel;
}
