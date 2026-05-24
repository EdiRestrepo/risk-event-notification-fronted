import type { RealTimeAlert } from '../../notification.service';

/**
 * Observer del dominio: cualquier componente/servicio interesado en cambios
 * de alertas implementa este contrato o se suscribe al Observable expuesto.
 */
export interface RiskAlertObserver {
  update(alerts: RealTimeAlert[]): void;
}
