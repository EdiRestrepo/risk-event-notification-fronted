import type { RealTimeAlert } from '../../notification.service';
import { RiskAlertObserver } from './risk-alert-observer.interface';

/**
 * Subject del patrón Observer adaptado a Angular/RxJS.
 * Mantiene la estructura GoF del patrón Observer:
 * - Lista de observadores (subscribers)
 * - Métodos para suscribir/desuscribirse
 * - Método para notificar a todos los observadores
 * - Métodos de negocio que disparan notificaciones
 */
export interface RiskAlertSubject {
  /** Registra un observador en la lista central de suscriptores */
  attach(observer: RiskAlertObserver): () => void;

  /** Publica una nueva alerta y notifica a todos los observadores */
  publishAlert(alert: RealTimeAlert): void;

  /** Elimina una alerta por ID y notifica a todos los observadores */
  removeAlert(alertId: string): void;

  /** Limpia todas las alertas y notifica a todos los observadores */
  clearAlerts(): void;

  /** Obtiene una copia del estado actual de alertas */
  getSnapshot(): RealTimeAlert[];
}
