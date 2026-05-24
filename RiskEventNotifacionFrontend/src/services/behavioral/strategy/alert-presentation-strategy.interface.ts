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
 *
 * Patrón GoF Strategy:
 * - canHandle(alert): determina si esta estrategia puede procesar la alerta
 * - execute(alert): procesa la alerta y genera el ViewModel (Patrón GoF)
 * - buildViewModel(alert): alias de execute(), mantiene compatibilidad hacia atrás
 */
export interface AlertPresentationStrategy {
  /**
   * Determina si esta estrategia puede manejar la alerta dada.
   * @param alert - Alerta a evaluar
   * @returns true si esta estrategia puede procesarla
   */
  canHandle(alert: RealTimeAlert): boolean;

  /**
   * Método principal de la estrategia (Patrón GoF).
   * Procesa la alerta y genera su representación visual.
   * @param alert - Alerta a procesar
   * @returns ViewModel listo para renderizar
   */
  execute(alert: RealTimeAlert): AlertPresentationViewModel;

  /**
   * Alias para mantener compatibilidad con código existente.
   * Internamente debe llamar a execute().
   * @param alert - Alerta a procesar
   * @returns ViewModel listo para renderizar
   */
  buildViewModel(alert: RealTimeAlert): AlertPresentationViewModel;
}
