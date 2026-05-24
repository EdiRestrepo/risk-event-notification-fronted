import type { RealTimeAlert } from '../../models/risk-alert.model';

export type AlertPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

/**
 * Resultado de aplicar una estrategia de presentacion a una alerta del dominio.
 * El componente solo pinta este ViewModel; no decide reglas de negocio.
 */
export interface AlertPresentationViewModel {
  alert: RealTimeAlert;
  alertId: string;
  title: string;
  message: string;
  location: string;
  source: string;
  receivedAt: Date;
  createdAt: string;
  expiresAt: string;
  instructions: string[];
  channels: number[];
  riskLabel: string;
  iconClass: string;
  visualClass: string;
  recommendation: string;
  priority: AlertPriority;
  requiresImmediateAction: boolean;
  autoCloseMilliseconds: number;
  simulated: boolean;
  decoratedTitle?: string;
  decoratedMessage?: string;
  decoratorRiskLevel?: 'NARANJA' | 'ROJO' | 'GRIS';
  decoratorAlertType?: string;
  factoryChannels?: string[];
}

/**
 * Strategy del dominio: cada tipo de riesgo define su propia forma de
 * comunicarse visualmente al ciudadano.
 */
export interface AlertPresentationStrategy {
  canHandle(alert: RealTimeAlert): boolean;
  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel;
}
