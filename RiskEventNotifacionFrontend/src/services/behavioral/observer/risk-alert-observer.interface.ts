import type { RealTimeAlert } from '../../notification.service';

/**
 * Observer del dominio: cualquier componente/servicio interesado en cambios
 * de alertas implementa este contrato o se suscribe al Observable expuesto.
 *
 * Patrón GoF Observer:
 * - El Publisher (RiskAlertEventBusService) mantiene lista de observadores
 * - Cuando el estado cambia, el Publisher invoca update() en cada observador
 * - El observador reacciona en su método update() sin conocer otros observadores
 */
export interface RiskAlertObserver {
  /**
   * Método de notificación llamado por el Publisher cuando el estado cambia.
   * El observador recibe el nuevo contexto (lista de alertas) y actualiza su lógica.
   *
   * @param alerts - Estado actual de las alertas (contexto de la notificación)
   */
  update(alerts: RealTimeAlert[]): void;
}
